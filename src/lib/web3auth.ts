import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // Web3Auth testnet client ID

// Linea Mainnet configuration
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xe708", // 59144 in hex (Linea Mainnet)
  rpcTarget: "https://rpc.linea.build",
  displayName: "Linea Mainnet",
  blockExplorerUrl: "https://lineascan.build",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

// Initialize the provider with the current chain
privateKeyProvider.setupProvider(chainConfig.chainId);

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
  privateKeyProvider: privateKeyProvider as any, // Type assertion to bypass interface issue
  uiConfig: {
    appName: "PlusOne",
    mode: "dark",
    loginMethodsOrder: ["twitter"],
    logoLight: "https://web3auth.io/images/web3authlog.png",
    logoDark: "https://web3auth.io/images/web3authlogodark.png",
    defaultLanguage: "en",
    modalZIndex: "99999",
  },
});

export class Web3AuthService {
  private web3: Web3 | null = null;
  private provider: IProvider | null = null;

  async init() {
    try {
      await web3auth.init();
      return true;
    } catch (error) {
      console.error("Failed to initialize Web3Auth:", error);
      return false;
    }
  }

  async login() {
    try {
      const web3authProvider = await web3auth.connect();
      
      if (web3authProvider) {
        this.provider = web3authProvider;
        this.web3 = new Web3(web3authProvider);
        
        // Get user info
        const user = await web3auth.getUserInfo();
        
        // Get wallet address
        const accounts = await this.web3.eth.getAccounts();
        const address = accounts[0];

        return {
          success: true,
          user: {
            email: user.email,
            name: user.name,
            profileImage: user.profileImage,
            verifierId: user.name || user.email?.split('@')[0] || 'User', // Fallback for verifierId
          },
          wallet: {
            address,
            provider: web3authProvider,
          }
        };
      }
      
      return { success: false, error: "Failed to connect" };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await web3auth.logout();
      this.provider = null;
      this.web3 = null;
      return { success: true };
    } catch (error: any) {
      console.error("Logout failed:", error);
      return { success: false, error: error.message };
    }
  }

  async getBalance(address: string) {
    if (!this.web3) return "0";
    
    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, "ether");
    } catch (error) {
      console.error("Failed to get balance:", error);
      return "0";
    }
  }

  async sendTransaction(to: string, amount: string) {
    if (!this.web3 || !this.provider) {
      throw new Error("Web3Auth not initialized");
    }

    try {
      const accounts = await this.web3.eth.getAccounts();
      const from = accounts[0];
      
      const txReceipt = await this.web3.eth.sendTransaction({
        from,
        to,
        value: this.web3.utils.toWei(amount, "ether"),
      });
      
      return { success: true, txHash: txReceipt.transactionHash };
    } catch (error: any) {
      console.error("Transaction failed:", error);
      return { success: false, error: error.message };
    }
  }

  isConnected() {
    return web3auth.connected;
  }

  getProvider() {
    return this.provider;
  }

  getWeb3() {
    return this.web3;
  }
}

export const web3AuthService = new Web3AuthService();