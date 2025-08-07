import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3 from "web3";

// Web3Auth Client ID for testnet (replace with your own for production)
const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ";

// Linea Mainnet configuration
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xe708", // 59144 in decimal (Linea Mainnet)
  rpcTarget: "https://rpc.linea.build",
  displayName: "Linea Mainnet",
  blockExplorerUrl: "https://lineascan.build",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://avatars.githubusercontent.com/u/111895529?s=200&v=4",
};

let web3auth: Web3Auth | null = null;

class Web3AuthService {
  private web3: Web3 | null = null;
  private provider: IProvider | null = null;
  private isInitialized = false;

  async init(): Promise<boolean> {
    try {
      if (this.isInitialized && web3auth) {
        return true;
      }

      console.log("Initializing Web3Auth...");

      // Create private key provider
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig },
      });

      // Setup provider with chain
      await privateKeyProvider.setupProvider(chainConfig.chainId);

      web3auth = new Web3Auth({
        clientId,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
        privateKeyProvider: privateKeyProvider as any,
        uiConfig: {
          appName: "PlusOne Wallet",
          mode: "dark",
          logoLight: "https://web3auth.io/images/web3authlog.png",
          logoDark: "https://web3auth.io/images/web3authlogodark.png",
          defaultLanguage: "en",
          modalZIndex: "99999",
          loginMethodsOrder: ["twitter", "google"],
        },
      });

      await web3auth.init();
      this.isInitialized = true;
      
      console.log("Web3Auth initialized successfully");
      return true;
    } catch (error) {
      console.error("Web3Auth initialization failed:", error);
      return false;
    }
  }

  async login() {
    try {
      if (!web3auth) {
        throw new Error("Web3Auth not initialized");
      }

      console.log("Starting login process...");

      const web3authProvider = await web3auth.connect();
      
      if (!web3authProvider) {
        return { success: false, error: "Failed to connect to Web3Auth" };
      }

      this.provider = web3authProvider;
      this.web3 = new Web3(web3authProvider);

      // Get user info
      const user = await web3auth.getUserInfo();
      console.log("User info:", user);

      // Get wallet address
      const accounts = await this.web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const address = accounts[0];
      console.log("Wallet address:", address);

      return {
        success: true,
        user: {
          email: user.email,
          name: user.name,
          profileImage: user.profileImage,
          verifierId: user.name || user.email?.split('@')[0] || 'User',
        },
        wallet: {
          address,
          provider: web3authProvider,
        }
      };
    } catch (error: any) {
      console.error("Login failed:", error);
      return { 
        success: false, 
        error: error.message || "Authentication failed" 
      };
    }
  }

  async logout() {
    try {
      if (!web3auth) {
        throw new Error("Web3Auth not initialized");
      }

      await web3auth.logout();
      this.provider = null;
      this.web3 = null;
      
      return { success: true };
    } catch (error: any) {
      console.error("Logout failed:", error);
      return { success: false, error: error.message };
    }
  }

  async getBalance(address: string): Promise<string> {
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

  isConnected(): boolean {
    return web3auth?.connected || false;
  }

  getProvider(): IProvider | null {
    return this.provider;
  }

  getWeb3(): Web3 | null {
    return this.web3;
  }
}

export const web3AuthService = new Web3AuthService();