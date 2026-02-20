interface LemonSqueezyInstance {
  Url: {
    Open: (url: string) => void;
    Close: () => void;
  };
}

interface Window {
  createLemonSqueezy?: () => void;
  LemonSqueezy?: LemonSqueezyInstance;
}
