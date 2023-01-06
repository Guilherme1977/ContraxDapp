import React from "react";
import { getUserSession, setUserSession } from "../store/localStorage";
import * as ethers from "ethers";
import { removeUserSession } from "../store/localStorage";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";

export const WalletContext = React.createContext({
    currentWallet: "",
    displayAccount: "",
    connectWallet: () => {},
    networkId: "",
    logout: () => {},
    signer: null as any,
    provider: null as any,
});

interface IProps {
    children: React.ReactNode;
}

const WalletProvider: React.FC<IProps> = ({ children }) => {
    const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
    const [currentWallet, setCurrentWallet] = React.useState("");
    const [networkId, setNetworkId] = React.useState("");
    const [provider, setProvider] = React.useState<ethers.ethers.providers.Web3Provider | null>(null);
    const [signer, setSigner] = React.useState<ethers.ethers.providers.JsonRpcSigner | null>(null);
    const [
        {
            chains, // the list of chains that web3-onboard was initialized with
            connectedChain, // the current chain the user's wallet is connected to
            settingChain, // boolean indicating if the chain is in the process of being set
        },
        setChain, // function to call to initiate user to switch chains in their wallet
    ] = useSetChain();

    const connectWallet = async () => {
        const wallets = await connect();
        if (wallets) {
            setUserSession({
                address: wallets[0].accounts[0].address,
                networkId: wallets[0].chains[0].id,
            });

            setCurrentWallet(wallets[0].accounts[0].address);
            setNetworkId(wallets[0].chains[0].id);
        }
    };

    async function network() {
        const chainId = 42161;
        if (!connectedChain?.id) return;
        if (connectedChain.id !== chainId.toString()) {
            try {
                await setChain({
                    chainId: chainId.toString(),
                });
            } catch (err: any) {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                    await wallet?.provider?.request({
                        method: "wallet_addEthereumChain",
                        params: [
                            {
                                chainName: "Arbitrum One",
                                chainId: "0xA4B1",
                                nativeCurrency: { name: "ETH", decimals: 18, symbol: "ETH" },
                                rpcUrls: ["https://arb1.arbitrum.io/rpc/"],
                            },
                        ],
                    });
                }
            }
        }
    }

    async function walletFn() {
        if (!wallet) return;
        const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
        let accounts = await provider.send("eth_requestAccounts", []);
        let account = accounts[0];
        provider.on("accountsChanged", function (accounts) {
            account = accounts[0];
        });

        const signer = provider.getSigner();

        const address = await signer.getAddress();

        console.log(address.toLowerCase(), currentWallet);

        const data = getUserSession();
        if (data) {
            const userInfo = JSON.parse(data);
            if (address.toLowerCase() !== userInfo.address) {
                connectWallet();
            } else {
                console.log("Sorry");
            }
        }
    }

    async function logout() {
        removeUserSession();
        setCurrentWallet("");
        if (wallet) disconnect(wallet);
    }

    const displayAccount = React.useMemo(
        () => `${currentWallet.substring(0, 6)}...${currentWallet.substring(currentWallet.length - 5)}`,
        [currentWallet]
    );

    React.useEffect(() => {
        const data = getUserSession();
        if (data) {
            const userInfo = JSON.parse(data);
            setCurrentWallet(userInfo.address);
            setNetworkId(userInfo.networkId);
        }
    }, []);

    React.useEffect(() => {
        network();
        walletFn();
    }, [connectedChain, wallet, provider]);

    React.useEffect(() => {
        if (wallet) {
            const provider = new ethers.providers.Web3Provider(wallet.provider, "any");
            setProvider(provider);
            provider.send("eth_requestAccounts", []).then(() => {
                const signer = provider.getSigner();
                setSigner(signer);
            });
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{ currentWallet, connectWallet, networkId, logout, displayAccount, signer, provider }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export default WalletProvider;
