declare module 'myinfo-connector-nodejs' {
  interface MyInfoConfig {
    CLIENT_SECURE_CERT: string;
    CLIENT_SECURE_CERT_PASSPHRASE: string;
    MYINFO_SIGNATURE_CERT_PUBLIC_CERT: string;
    CLIENT_ID: string;
    CLIENT_SECRET: string;
    REDIRECT_URL: string;
    ATTRIBUTES: string;
    ENVIRONMENT: 'SANDBOX' | 'TEST' | 'PROD';
    TOKEN_URL: string;
    PERSON_URL: string;
    USE_PROXY: 'Y' | 'N';
    PROXY_TOKEN_URL?: string;
    PROXY_PERSON_URL?: string;
    DEBUG_LEVEL?: 'error' | 'info' | 'debug';
  }

  interface MyInfoPersonData {
    nationality: {
      code: string;
      desc: string;
    };
    residentialstatus: {
      code: string;
      desc: string;
    };
    [key: string]: any;
  }

  class MyInfoConnector {
    constructor(config: MyInfoConfig);
    getMyInfoPersonData(authCode: string, state: string, txnNo: string): Promise<MyInfoPersonData>;
    getAccessToken(authCode: string, state: string): Promise<string>;
    getPersonData(accessToken: string, txnNo: string): Promise<MyInfoPersonData>;
  }

  export default MyInfoConnector;
} 