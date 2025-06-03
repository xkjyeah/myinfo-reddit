// import * as jest from 'jest';
import { jest } from '@jest/globals';
import * as crypto from 'crypto';
import * as jose from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import * as request from 'request-promise';

import * as session from '@/app/api/auth/session';
import * as db from '@/lib/db';

import { GET as redditSubredditOwnerAuth } from '../../api/auth/subreddit-owner/route';
import { GET as redditCallback } from '../reddit/callback/route';
import { GET as redditFlair } from '../reddit/flair/route';
import { GET as redditLogin } from '../reddit/login/route';
import { GET as singpassCallback } from '../singpass/callback/route';
// Import the route handlers
import { GET as singpassLogin } from '../singpass/login/route';
import myinfoOpenidConfig from './fixtures/myinfo-openid-config';

// Mock external dependencies
jest.mock('@/lib/db', () => {
  return {
    ...jest.requireActual<any>('@/lib/db'),
    getRedditToken: jest.fn(),
    saveRedditToken: jest.fn(),
  };
});

jest.mock('openid-client', () => {
  return {
    ...jest.requireActual<any>('openid-client'),
    randomPKCECodeVerifier: jest.fn<any>().mockResolvedValue('mock-code-verifier'),
  };
});
// jest.mock('snoowrap', () => {
//   return {
//     ...jest.requireActual('snoowrap').default,
//   };
// });

const mockDb = {
  saveRedditToken: db.saveRedditToken as jest.MockedFunction<typeof db.saveRedditToken>,
  getRedditToken: db.getRedditToken as jest.MockedFunction<typeof db.getRedditToken>,
};

// Mock environment variables
const originalEnv = process.env;

type ResponseFunctionParams = {
  body: BodyInit;
};

const fetchFilters: {
  url?: string;
  method?: string;
  filter?: (params: ResponseFunctionParams) => boolean;
  response: (params: ResponseFunctionParams) => Promise<Response>;
  ttl: number;
}[] = [];

function mockedFetchImplementation(request: Request | string, requestInit?: RequestInit) {
  let canoncialRequest: Request;

  if (request instanceof Request) {
    canoncialRequest = request;
  } else {
    canoncialRequest = new Request(request, requestInit);
  }

  const body = requestInit?.body ?? '';

  const filter = fetchFilters.find((filter) => {
    if (filter.url && canoncialRequest.url !== filter.url) return false;
    if (filter.method && canoncialRequest.method !== filter.method) return false;
    if (filter.filter && !filter.filter({ body })) return false;
    if (filter.ttl === 0) return false;
    return true;
  });
  if (filter) {
    if (filter.ttl > 0) {
      filter.ttl--;
    }

    return filter.response({ body });
  } else {
    throw new Error(
      `No mock endpoint found for ${canoncialRequest.method} ${canoncialRequest.url}`
    );
  }
}

const mockFetch = jest.fn<any>().mockImplementation(mockedFetchImplementation);

global.fetch = mockFetch;

jest.mock('request-promise', () => {
  const r = jest.requireActual('request-promise') as any;
  const mock = jest.fn<any>() as any;
  // All the any casts above are because request-promise
  // adds additional properties to the default export
  mock.Request = r.Request;
  mock.Response = r.Response;
  mock.defaults = r.defaults;
  return mock;
});

(request as any).mockImplementation(async (i: any) => {
  const response = await mockedFetchImplementation(
    i.baseUrl.replace(/\/?$/, '') + i.uri.replace(/^\/?/, '/'),
    {
      method: i.method,
      headers: i.headers,
      body: i.form as any,
    }
  );

  if (i.resolveWithFullResponse) {
    return Promise.resolve({
      body: JSON.parse(new TextDecoder().decode((await response.body?.getReader().read())!.value)),
      headers: response.headers,
    });
  } else {
    const body = await response.body?.getReader().read();
    const bodyText = new TextDecoder().decode(body?.value);

    return Promise.resolve(JSON.parse(bodyText));
  }
});

function mockEndpoint(props: {
  url?: string;
  method?: string;
  filter?: (request: ResponseFunctionParams) => boolean;
  response: (request: ResponseFunctionParams) => Promise<Response>;
  ttl?: number;
}) {
  fetchFilters.push({
    ...props,
    response: props.response,
    ttl: props.ttl ?? 1,
  });
}

beforeEach(() => {
  fetchFilters.length = 0;
});

beforeAll(() => {
  const encKey = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  } as crypto.ECKeyPairOptions<'pem', 'pem'>);
  const sigKey = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  } as crypto.ECKeyPairOptions<'pem', 'pem'>);

  process.env = {
    ...originalEnv,
    // MyInfo Configuration
    MYINFO_APP_REDIRECT_URL: 'https://example.com/api/singpass/callback',
    MYINFO_HOST: 'https://stg-id.singpass.gov.sg',
    MYINFO_APP_ID: 'test-app-id',
    MYINFO_PRIVATE_ENC_KEY: (encKey.privateKey as string).replace(/\n/g, '|'),
    MYINFO_PRIVATE_SIG_KEY: (sigKey.privateKey as string).replace(/\n/g, '|'),
    // Reddit Configuration
    REDDIT_CLIENT_ID: 'test-reddit-client-id',
    REDDIT_CLIENT_SECRET: 'test-reddit-client-secret',
    REDDIT_REDIRECT_URI: 'https://example.com/api/reddit/callback',
    REDDIT_USER_AGENT: 'test-user-agent',
    // JWT Configuration
    JWT_SECRET: 'test-jwt-secret-key-for-testing-purposes-only',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Helper function to create mock requests
function createMockRequest(url: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(url);

  // Add cookies to the request
  Object.entries(cookies).forEach(([key, value]) => {
    request.cookies.set(key, value);
  });

  return request;
}

// Helper function to extract cookies from response
function extractCookies(response: NextResponse): Record<string, string> {
  const cookies: Record<string, string> = {};
  const setCookieHeaders = response.headers.getSetCookie();

  setCookieHeaders.forEach((cookieHeader) => {
    const [nameValue] = cookieHeader.split(';');
    const [name, value] = nameValue.split('=');
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value.trim());
    }
  });

  return cookies;
}

describe('End-to-End OAuth Flow', () => {
  describe('Complete User Flow: SingPass → Reddit → Flair Assignment', () => {
    it('should complete the full OAuth flow for a user getting verified flair', async () => {
      const subreddit = 'testsubreddit';

      mockEndpoint({
        url: 'https://stg-id.singpass.gov.sg/.well-known/openid-configuration',
        response: () => Promise.resolve(new Response(JSON.stringify(myinfoOpenidConfig))),
      });

      // Step 1: User initiates SingPass login with subreddit parameter
      const singpassLoginRequest = createMockRequest(
        `https://example.com/api/singpass/login?subreddit=${subreddit}`
      );

      const singpassLoginResponse = await singpassLogin(singpassLoginRequest);

      expect(singpassLoginResponse.status).toBe(307);
      const location = new URL(singpassLoginResponse.headers.get('location')!);
      expect(location.origin).toBe('https://stg-id.singpass.gov.sg');
      expect(location.pathname).toBe('/auth');
      expect(location.searchParams.get('response_type')).toBe('code');
      expect(location.searchParams.get('scope')).toBe('openid residentialstatus');
      expect(location.searchParams.get('code_challenge')).toBe(
        'qUmdgqlq8kCMG2ogmCQuKxBj7cLhzgSFoPB84-QwZM4'
      );
      expect(location.searchParams.get('code_challenge_method')).toBe('S256');
      expect(location.searchParams.get('redirect_uri')).toBe(
        'https://example.com/api/singpass/callback'
      );
      expect(location.searchParams.get('state')).toBeDefined();
      expect(location.searchParams.get('nonce')).toBeDefined();

      const loginCookies = extractCookies(singpassLoginResponse);
      expect(loginCookies.code_verifier).toBe('mock-code-verifier');
      expect(loginCookies.auth_state).toMatch(/[0-9a-f]{16}/); // hex encoded
      expect(loginCookies.nonce).toMatch(/[0-9a-f]{16}/); // hex encoded

      // Step 2: User completes SingPass authentication and returns to callback
      // Sample data
      // {
      //     redirect_uri: 'https://example.com/api/singpass/callback',
      //     code: 'auth-code',
      //     code_verifier: 'mock-code-verifier',
      //     grant_type: 'authorization_code',
      //     client_id: 'test-app-id',
      //     client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      //     client_assertion: 'eyJhbGciOiJFUzI1NiJ9.eyJqdGkiOiJPNWE1MlF4bWc5YkpTZEJYa2xQYmk3Xzd1UTRkb0xZdUtaVjNDMjA1Yk1zIiwiYXVkIjoiaHR0cHM6Ly9zdGctaWQuc2luZ3Bhc3MuZ292LnNnIiwiZXhwIjoxNzQ4NDg2MDM3LCJpYXQiOjE3NDg0ODU5NzcsIm5iZiI6MTc0ODQ4NTk3NywiaXNzIjoidGVzdC1hcHAtaWQiLCJzdWIiOiJ0ZXN0LWFwcC1pZCJ9.FahQm_b0hCafWaEESSCy1-QKLobTCiTScp6EMPjE5o60stAYrjfOQ26JpNI-_6ebwxEP3A9CIQDYP0k8xvd_sQ'
      //   }
      mockEndpoint({
        url: 'https://stg-id.singpass.gov.sg/token',
        response: async ({ body }) => {
          const formData = body as any;

          const parsedData = Object.fromEntries(formData.entries());

          expect(parsedData.redirect_uri).toBe('https://example.com/api/singpass/callback');
          expect(parsedData.code).toBe('auth-code');
          expect(parsedData.code_verifier).toBe('mock-code-verifier');
          expect(parsedData.grant_type).toBe('authorization_code');
          expect(parsedData.client_id).toBe('test-app-id');
          expect(parsedData.client_assertion_type).toBe(
            'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
          );
          expect(parsedData.client_assertion).toBeDefined();

          return Promise.resolve(
            new Response(
              JSON.stringify({
                access_token: 'mock-access-token',
                // refresh_token: null,
                expires_in: 3600,
                token_type: 'Bearer',
                id_token: await new jose.SignJWT({ nonce: loginCookies.nonce })
                  .setJti('jti-nonce')
                  .setProtectedHeader({ alg: 'ES256' })
                  .setIssuedAt()
                  .setIssuer('https://stg-id.singpass.gov.sg')
                  .setSubject('some-subject')
                  .setExpirationTime('1h')
                  .setAudience('test-app-id')
                  .sign(crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey),
              })
            )
          );
        },
      });

      mockEndpoint({
        url: 'https://stg-id.singpass.gov.sg/userinfo',
        response: async () => {
          return Promise.resolve(
            new Response(
              await new jose.SignJWT({ residentialstatus: { code: 'C' } })
                .setProtectedHeader({ alg: 'ES256' })
                .setSubject('some-subject')
                .sign(crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey),
              { headers: { 'content-type': 'application/jwt' } }
            )
          );
        },
      });

      const callbackUrl = `https://example.com/api/singpass/callback?code=auth-code&state=${loginCookies.auth_state}`;
      const singpassCallbackRequest = createMockRequest(callbackUrl, {
        code_verifier: loginCookies.code_verifier,
        auth_state: loginCookies.auth_state,
        nonce: loginCookies.nonce,
      });

      const singpassCallbackResponse = await singpassCallback(singpassCallbackRequest);

      expect(singpassCallbackResponse.status).toBe(307);
      expect(singpassCallbackResponse.headers.get('location')).toMatch(/\/reddit-auth$/);

      // Verify that auth data was set with residential status
      const callbackCookies = extractCookies(singpassCallbackResponse);
      expect(callbackCookies.auth).toBeDefined();

      // Step 3: User proceeds to Reddit authentication
      const redditLoginRequest = createMockRequest(
        `https://example.com/api/reddit/login?subreddit=${subreddit}`,
        { auth: callbackCookies.auth }
      );

      const redditLoginResponse = await redditLogin(redditLoginRequest);

      expect(redditLoginResponse.status).toBe(307);
      expect(redditLoginResponse.headers.get('location')).toContain('reddit.com/api/v1/authorize');

      // Step 4: User completes Reddit authentication and returns to callback
      const redditCallbackUrl = `https://example.com/api/reddit/callback?code=reddit-auth-code&state=${encodeURIComponent(
        JSON.stringify({
          random: 'test',
          scopes: ['identity'],
          subreddit: subreddit,
        })
      )}`;

      mockEndpoint({
        url: 'https://www.reddit.com/api/v1/access_token',
        response: async ({ body }) => {
          const formData = body as any;

          expect(formData.code).toBe('reddit-auth-code');
          expect(formData.grant_type).toBe('authorization_code');
          expect(formData.redirect_uri).toBe('https://example.com/api/reddit/callback');

          return Promise.resolve(
            new Response(
              JSON.stringify({
                accessToken: 'mock-access-token',
                expiresIn: 3600,
                tokenType: 'Bearer',
              })
            )
          );
        },
      });
      mockEndpoint({
        url: 'https://oauth.reddit.com/api/v1/me',
        response: async () => {
          return new Response(JSON.stringify({ name: 'mock_test_user' }));
        },
      });

      const redditCallbackRequest = createMockRequest(redditCallbackUrl, {
        auth: callbackCookies.auth,
      });
      const redditCallbackResponse = await redditCallback(redditCallbackRequest);

      expect(redditCallbackResponse.status).toBe(307);
      expect(redditCallbackResponse.headers.get('location')).toContain('/api/reddit/flair');

      const redditCallbackCookies = extractCookies(redditCallbackResponse);

      // Step 5: Flair assignment happens automatically
      jest.spyOn(db, 'getRedditToken').mockResolvedValueOnce('mock-refresh-token');

      mockEndpoint({
        url: 'https://www.reddit.com/api/v1/access_token',
        response: async ({ body }) => {
          const formData = body as any;

          expect(formData.refresh_token).toBe('mock-refresh-token');
          expect(formData.grant_type).toBe('refresh_token');

          return Promise.resolve(
            new Response(
              JSON.stringify({
                accessToken: 'mock-access-token',
                expiresIn: 3600,
                tokenType: 'Bearer',
                scope: 'modflair flair',
              })
            )
          );
        },
        ttl: 5,
      });
      mockUserFlairV2();

      mockEndpoint({
        method: 'POST',
        url: 'https://oauth.reddit.com/r/testsubreddit/api/flaircsv',
        response: async ({ body }) => {
          const formData = body as any;

          expect(formData.flair_csv).toBe('"mock_test_user","Citizen","sg-verified-citizen"');

          return Promise.resolve(new Response(JSON.stringify([{ ok: true }])));
        },
      });

      const flairRequest = createMockRequest('https://example.com/api/reddit/flair', {
        auth: redditCallbackCookies.auth,
      });

      const flairResponse = await redditFlair(flairRequest);

      expect(flairResponse.status).toBe(307);
      expect(flairResponse.headers.get('location')).toBe(`https://reddit.com/r/${subreddit}`);
    });
  });

  describe('Moderator Flow: Reddit OAuth for Flair Management', () => {
    it('should complete the moderator authorization flow', async () => {
      const subreddit = 'testsubreddit';

      // Step 1: Moderator initiates Reddit OAuth with modflair scope
      const modAuthorizeRequest = createMockRequest(
        `https://example.com/api/reddit/subreddit-owner?subreddit=${subreddit}`
      );
      const modAuthorizeResponse = await redditSubredditOwnerAuth(modAuthorizeRequest);

      // Example: "https://www.reddit.com/api/v1/authorize?client_id=test-reddit-client-id&response_type=code&state=%7B%22random%22%3A%22%22%2C%22scopes%22%3A%5B%22modflair%22%2C%22flair%22%5D%2C%22subreddit%22%3A%22testsubreddit%22%7D&redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Freddit%2Fcallback&duration=permanent&scope=modflair%20flair"
      expect(modAuthorizeResponse.status).toBe(307);
      const redirectUrl = new URL(modAuthorizeResponse.headers.get('location')!);
      expect(redirectUrl.origin).toBe('https://www.reddit.com');
      expect(redirectUrl.pathname).toBe('/api/v1/authorize');
      expect(redirectUrl.searchParams.get('client_id')).toBe(process.env.REDDIT_CLIENT_ID);
      expect(redirectUrl.searchParams.get('response_type')).toBe('code');
      expect(redirectUrl.searchParams.get('scope')).toBe('modflair flair');
      expect(redirectUrl.searchParams.get('state')).toBeDefined();
      expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
        'https://example.com/api/reddit/callback'
      );
      expect(redirectUrl.searchParams.get('duration')).toBe('permanent');

      // Step 2: Reddit returns refresh token
      mockEndpoint({
        url: 'https://www.reddit.com/api/v1/access_token',
        method: 'POST',
        response: async ({ body }) => {
          const formData = body as any;
          expect(formData.code).toBe('mod-auth-code');
          expect(formData.grant_type).toBe('authorization_code');
          expect(formData.redirect_uri).toBe('https://example.com/api/reddit/callback');

          return Promise.resolve(
            new Response(
              JSON.stringify({
                accessToken: 'mock-access-token',
                expiresIn: 3600,
                tokenType: 'Bearer',
                refreshToken: 'mock-moderator-refresh-token',
              })
            )
          );
        },
      });
      // Step 2a: the refresh token is used for the next request
      mockEndpoint({
        url: 'https://www.reddit.com/api/v1/access_token',
        method: 'POST',
        response: async ({ body }) => {
          const formData = body as any;
          expect(formData.refresh_token).toBe('mock-moderator-refresh-token');
          expect(formData.grant_type).toBe('refresh_token');

          return Promise.resolve(
            new Response(
              JSON.stringify({
                accessToken: 'mock-access-token',
                expiresIn: 3600,
                tokenType: 'Bearer',
                scope: 'modflair flair',
              })
            )
          );
        },
      });
      mockEndpoint({
        url: 'https://oauth.reddit.com/r/testsubreddit/api/flairselector',
        method: 'POST',
        response: async () => {
          return Promise.resolve(new Response(JSON.stringify([])));
        },
      });
      const saveRedditTokenMock = (db.saveRedditToken as jest.Mock<any>).mockResolvedValue({});

      const modCallbackUrl = `https://example.com/api/reddit/callback?code=mod-auth-code&state=${encodeURIComponent(
        JSON.stringify({
          random: 'test',
          scopes: ['modflair', 'flair'],
          subreddit: subreddit,
        })
      )}`;

      const modCallbackRequest = createMockRequest(modCallbackUrl);
      const modCallbackResponse = await redditCallback(modCallbackRequest);
      expect(modCallbackResponse.status).toBe(307);
      expect(modCallbackResponse.headers.get('location')).toContain('/post-moderator-auth');
      expect(modCallbackResponse.headers.get('location')).toContain(`subreddit=${subreddit}`);
      expect(saveRedditTokenMock).toHaveBeenCalledWith(subreddit, 'mock-moderator-refresh-token');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing subreddit authorization for flair assignment', async () => {
      // Mock no stored refresh token for subreddit
      mockDb.getRedditToken.mockResolvedValueOnce(null);

      const flairRequest = createMockRequest('https://example.com/api/reddit/flair');

      // Mock auth data with required fields
      jest.spyOn(session, 'getAuthData').mockResolvedValueOnce({
        residentialStatus: 'C',
        redditUsername: 'test-user',
        targetSubreddit: 'testsubreddit',
      });

      const response = await redditFlair(flairRequest);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('This community has not allowed this app to add flair');
    });

    it('should handle invalid state in SingPass callback', async () => {
      const callbackUrl =
        'https://example.com/api/singpass/callback?code=auth-code&state=invalid-state';
      const request = createMockRequest(callbackUrl, {
        code_verifier: 'mock-code-verifier',
        auth_state: 'different-state',
        nonce: 'mock-nonce',
      });

      const response = await singpassCallback(request);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid state');
    });

    it('should handle Reddit authentication failure', async () => {
      const callbackUrl = `https://example.com/api/reddit/callback?code=invalid-code&state=${encodeURIComponent(
        JSON.stringify({
          random: 'test',
          scopes: ['identity'],
          subreddit: 'testsubreddit',
        })
      )}`;

      const request = createMockRequest(callbackUrl);
      const response = await redditCallback(request);

      expect(response.status).toBe(500);
      const responseData = await response.json();
      expect(responseData.error).toBe('Authentication failed');
    });

    it('should handle missing flair templates', async () => {
      // Mock refresh token in DB
      mockDb.getRedditToken.mockResolvedValueOnce('mock-refresh-token');
      mockModeratorRefreshToken();
      mockUserFlairV2([]);

      const flairRequest = createMockRequest('https://example.com/api/reddit/flair');

      // Mock auth data
      jest.spyOn(session, 'getAuthData').mockResolvedValueOnce({
        residentialStatus: 'C',
        redditUsername: 'test-user',
        targetSubreddit: 'testsubreddit',
      });

      const response = await redditFlair(flairRequest);

      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe(
        'Missing flair templates for C, P, A. Please ask the moderator of the subreddit to complete the setup of this app.'
      );
    });
  });

  describe('Different Residential Status Types', () => {
    it.each([
      ['C', 'Citizen', 'verified-citizen'],
      ['P', 'Permanent Resident', 'verified-pr'],
      ['A', 'Foreigner', 'verified-foreigner'],
    ])(
      'should assign correct flair for residential status %s',
      async (statusCode, expectedText, expectedCssClass) => {
        // Mock session assignment
        jest.spyOn(session, 'getAuthData').mockResolvedValueOnce({
          residentialStatus: statusCode,
          redditUsername: 'test-user',
          targetSubreddit: 'testsubreddit',
        });
        // Mock refresh token in DB
        mockDb.getRedditToken.mockResolvedValueOnce('mock-refresh-token');
        // Mock access token endpoint
        mockModeratorRefreshToken();
        // Mock user_flair_v2
        mockUserFlairV2();

        // Mock flair assignment endpoint
        mockEndpoint({
          url: 'https://oauth.reddit.com/r/testsubreddit/api/flaircsv',
          response: async ({ body }) => {
            expect((body as any).flair_csv).toBe(
              `"test-user","${expectedText}","sg-${expectedCssClass}"`
            );
            return Promise.resolve(new Response(JSON.stringify([{ ok: true }])));
          },
        });

        // Test flair assignment
        const flairRequest = createMockRequest('https://example.com/api/reddit/flair');
        const flairResponse = await redditFlair(flairRequest);
        expect(flairResponse.status).toBe(307);
        const location = new URL(flairResponse.headers.get('location')!);
        expect(location.pathname).toBe(`/r/testsubreddit`);
      }
    );
  });

  function mockModeratorRefreshToken() {
    mockEndpoint({
      url: 'https://www.reddit.com/api/v1/access_token',
      method: 'POST',
      response: async ({ body }) => {
        const formData = body as any;
        expect(formData.refresh_token).toBe('mock-refresh-token');
        expect(formData.grant_type).toBe('refresh_token');
        return Promise.resolve(
          new Response(
            JSON.stringify({
              accessToken: 'mock-access-token',
              expiresIn: 3600,
              tokenType: 'Bearer',
              scope: 'modflair flair',
            })
          )
        );
      },
      ttl: 5,
    });
  }

  function mockUserFlairV2(flairs?: any) {
    mockEndpoint({
      url: 'https://oauth.reddit.com/r/testsubreddit/api/user_flair_v2',
      response: async () => {
        return Promise.resolve(
          new Response(
            JSON.stringify(
              flairs ?? [
                {
                  text: 'Citizen',
                  text_color: 'light',
                  mod_only: true,
                  background_color: '#de21b8',
                  css_class: 'sg-verified-citizen',
                  text_editable: false,
                  override_css: false,
                  type: 'text',
                },
                {
                  text: 'Permanent Resident',
                  text_color: 'light',
                  mod_only: true,
                  background_color: '#3989c6',
                  css_class: 'sg-verified-pr',
                  text_editable: false,
                  override_css: false,
                  type: 'text',
                },
                {
                  text: 'Foreigner',
                  text_color: 'light',
                  mod_only: true,
                  background_color: '#59a68c',
                  css_class: 'sg-verified-foreigner',
                  text_editable: false,
                  override_css: false,
                  type: 'text',
                },
              ]
            )
          )
        );
      },
    });
  }
});
