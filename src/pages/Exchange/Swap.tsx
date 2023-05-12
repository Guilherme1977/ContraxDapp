import React from "react";
import uniswapTokens from "./uniswapTokens.json";
import { useWebSocketProvider } from "wagmi";
import useWallet from "src/hooks/useWallet";
import useBalances from "src/hooks/useBalances";
import useApp from "src/hooks/useApp";
import { SwapWidget, darkTheme, lightTheme, TokenInfo } from "@uniswap/widgets";

interface IProps {}

const Swap: React.FC<IProps> = () => {
    const { connectWallet, signer: wagmiSigner } = useWallet();
    const { reloadBalances } = useBalances();
    const { lightMode } = useApp();

    return (
        <SwapWidget
            theme={
                lightMode
                    ? {
                          ...lightTheme,
                          //   accent: "#08a7c7",
                          //   accentSoft: "#63cce0",
                          accent: "#63cce0",
                          accentSoft: "#dcf9ff",
                          networkDefaultShadow: "rgba(99, 204, 224,0.1)",
                      }
                    : { ...darkTheme, accent: "#63cce0", accentSoft: "#dcf9ff" }
            }
            // @ts-ignore
            provider={wagmiSigner?.provider}
            onConnectWalletClick={connectWallet}
            onTxSuccess={reloadBalances}
            tokenList={uniswapTokens}
            permit2={true}
        />
    );
};

export default Swap;