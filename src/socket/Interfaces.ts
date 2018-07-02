export interface INetworkFrame {
  chan?: string | any;
  user?: string | any;
  error?: Error;
  data?: any;
}

interface IServiceRequest {
  kind: "request";
  service: string;
  command: string;
  params: { [prop: string]: string };
  identity: any;
}
