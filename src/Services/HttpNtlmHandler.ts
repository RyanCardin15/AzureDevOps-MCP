import * as http from 'http';
import {
  IRequestHandler,
  IHttpClientResponse,
  IRequestInfo,
  IHttpClient,
} from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const httpntlm = require('httpntlm');

/**
 * IRequestHandler implementation that performs NTLM authentication via the
 * httpntlm package. The built-in getNtlmHandler (typed-rest-client) is broken
 * over plain HTTP because its regex fails to parse the WWW-Authenticate header
 * when it is not the first scheme in the list. httpntlm always sends an explicit
 * "Authorization: NTLM" Type-1 message, avoiding the Negotiate/NTLM ambiguity,
 * and manages its own keep-alive agent for the three-step handshake.
 */
export class HttpNtlmHandler implements IRequestHandler {
  private readonly username: string;
  private readonly password: string;
  private readonly domain: string;
  private readonly workstation: string;

  constructor(
    username: string,
    password: string,
    domain?: string,
    workstation?: string,
  ) {
    this.username    = username;
    this.password    = password;
    this.domain      = domain      ?? '';
    this.workstation = workstation ?? '';
  }

  /** Called before every request — nothing to add; httpntlm owns its headers. */
  prepareRequest(_options: http.RequestOptions): void {}

  /** Offer to handle any 401 that advertises NTLM. */
  canHandleAuthentication(response: IHttpClientResponse): boolean {
    const status   = response.message.statusCode ?? 0;
    const wwwAuth  = (response.message.headers['www-authenticate'] ?? '') as string;
    return status === 401 && wwwAuth.toUpperCase().includes('NTLM');
  }

  /**
   * Redo the full request through httpntlm (Type1→Type2→Type3) and return the
   * authenticated response wrapped as IHttpClientResponse.
   *
   * @param _httpClient  - unused; httpntlm is a self-contained HTTP client
   * @param requestInfo  - contains the parsed URL and original request options
   * @param objs         - the raw request body (string) forwarded by typed-rest-client
   */
  handleAuthentication(
    _httpClient: IHttpClient,
    requestInfo: IRequestInfo,
    objs: any,
  ): Promise<IHttpClientResponse> {
    return new Promise((resolve, reject) => {
      const url    = requestInfo.parsedUrl.href as string;
      const method = (requestInfo.options.method ?? 'GET').toLowerCase();

      const ntlmOpts: Record<string, any> = {
        url,
        username:    this.username,
        password:    this.password,
        domain:      this.domain,
        workstation: this.workstation,
      };

      // Forward the original body for POST / PUT / PATCH requests
      if (typeof objs === 'string' && objs.length > 0) {
        ntlmOpts.body = objs;
      }

      // Forward request headers set by the SDK (Accept, Content-Type, etc.)
      if (requestInfo.options.headers) {
        ntlmOpts.headers = { ...requestInfo.options.headers as Record<string, string> };
      }

      httpntlm[method](ntlmOpts, (err: Error | null, res: any) => {
        if (err) return reject(err);

        // Duck-type IHttpClientResponse — the SDK only uses statusCode, headers,
        // and readBody() after handleAuthentication resolves.
        const fakeMessage = Object.assign(Object.create(http.IncomingMessage.prototype), {
          statusCode: res.statusCode as number,
          headers:    (res.headers ?? {}) as http.IncomingHttpHeaders,
        });

        const body = typeof res.body === 'string' ? res.body : '';

        resolve({
          message:  fakeMessage,
          readBody: () => Promise.resolve(body),
        });
      });
    });
  }
}
