import React, { useRef } from "react";
import useWallet from "src/hooks/useWallet";
import useApp from "src/hooks/useApp";
import { Bridge } from "@socket.tech/plugin";
import { defaultChainId, RAMP_TRANSAK_API_KEY, SOCKET_API_KEY } from "src/config/constants";
// import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

import PoolButton from "src/components/PoolButton/PoolButton";
import { SwapWidget, darkTheme, lightTheme, TokenInfo } from "@uniswap/widgets";
import "@uniswap/widgets/fonts.css";
import styles from "./Exchange.module.scss";
import "./Exchange.css";
import { useSigner, useWebSocketProvider } from "wagmi";
import { getWeb3AuthProvider } from "src/config/walletConfig";
import useFarms from "src/hooks/farms/useFarms";
import { useSearchParams } from "react-router-dom";
import useBalances from "src/hooks/useBalances";
import { Tabs } from "src/components/Tabs/Tabs";
import uniswapTokens from "./uniswapTokens.json";

interface IProps {}

const darkSocketTheme = {
    width: 360,
    responsiveWidth: false,
    borderRadius: 1,
    secondary: "rgb(68,69,79)",
    primary: "rgb(31,34,44)",
    accent: "rgb(131,249,151)",
    onAccent: "rgb(0,0,0)",
    interactive: "rgb(0,0,0)",
    onInteractive: "rgb(240,240,240)",
    text: "rgb(255,255,255)",
    secondaryText: "rgb(200,200,200)",
};
const lightSocketTheme = {
    width: 360,
    responsiveWidth: false,
    borderRadius: 1,
    secondary: "rgb(241,245,249)",
    primary: "rgb(255,255,255)",
    accent: "rgb(239,51,116)",
    onAccent: "rgb(255,255,255)",
    interactive: "rgb(241,245,249)",
    onInteractive: "rgb(10,10,10)",
    text: "rgb(0,0,0)",
    secondaryText: "rgb(68,68,68)",
};
enum Tab {
    Swap = "Swap",
    Bridge = "Bridge",
    Buy = "Buy",
}

const Exchange: React.FC<IProps> = () => {
    const { currentWallet, connectWallet, chains, signer: wagmiSigner } = useWallet();
    const [chainId, setChainId] = React.useState<number>(defaultChainId);
    const { data: signer } = useSigner({
        chainId,
    });
    const [params, setSearchParams] = useSearchParams();
    const { reloadBalances } = useBalances();

    const { lightMode } = useApp();
    const containerRef = useRef<HTMLDivElement>(null);
    const [provider, setProvider] = React.useState<any>();
    const websocketProvider = useWebSocketProvider();
    const [tab, setTab] = React.useState<Tab>(Tab.Buy);
    const [isWeb3Auth, setIsWeb3Auth] = React.useState(false);

    // Reload Balances every time this component unmounts
    React.useEffect(() => reloadBalances, []);

    // Check for query params regarding tab, if none, default = Buy
    React.useEffect(() => {
        let tab = params.get("tab");
        if (tab) setTab(tab as Tab);
        else
            setSearchParams((params) => {
                params.set("tab", Tab.Buy);
                return params;
            });
    }, [params]);

    // React.useEffect(() => {
    //     if (tab === Tab.Buy) {
    //         const ramp = new RampInstantSDK({
    //             userAddress: currentWallet,
    //             defaultAsset: "ARBITRUM_USDC",
    //             swapAsset: "ARBITRUM_*",
    //             fiatValue: "500",
    //             fiatCurrency: "USD",
    //             hostAppName: "Contrax",
    //             hostLogoUrl: `https://${window.location.host}/logo.svg`,
    //             hostApiKey: RAMP_SDK_HOST_API_KEY,
    //             variant: "embedded-mobile",
    //             containerNode: containerRef.current || undefined,
    //         })
    //             // @ts-ignore
    //             .on("PURCHASE_CREATED", reloadBalances)
    //             .show();
    //         return () => {
    //             ramp.close();
    //         };
    //     }
    // }, [containerRef, tab, currentWallet]);

    const handleBridgeNetworkChange = async () => {
        try {
            // @ts-ignore
            const pkey = await signer?.provider?.provider?.request({ method: "eth_private_key" });

            if (!pkey) {
                setIsWeb3Auth(true);
                setProvider(undefined);
                return;
            }
            const chain = chains.find((c) => c.id === chainId);
            const _provider = await getWeb3AuthProvider({
                chainId: chain?.id!,
                blockExplorer: chain?.blockExplorers?.default.url!,
                name: chain?.name!,
                rpc: chain?.rpcUrls.public.http[0]!,
                ticker: chain?.nativeCurrency.symbol!,
                tickerName: chain?.nativeCurrency.name!,
                pkey,
            });
            setProvider(_provider);
            setIsWeb3Auth(true);
        } catch {
            // switchNetworkAsync && (await switchNetworkAsync(chainId));
            setIsWeb3Auth(false);
        }
    };

    React.useEffect(() => {
        if (tab === Tab.Bridge) handleBridgeNetworkChange();
    }, [currentWallet, chainId, signer, tab]);

    React.useEffect(() => {
        if (tab !== Tab.Bridge) {
            setChainId(defaultChainId);
        }
    }, [tab]);

    return (
        <div
            style={{
                padding: "20px 8px 120px 8px",
                overflow: "auto",
                gridTemplateRows: "553px",
                height: "100%",
            }}
        >
            <Tabs>
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Buy);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Buy);
                            return params;
                        });
                    }}
                    description="Buy"
                    active={tab === Tab.Buy}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Bridge);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Bridge);
                            return params;
                        });
                    }}
                    description="Bridge"
                    active={tab === Tab.Bridge}
                />
                <PoolButton
                    variant={2}
                    onClick={() => {
                        setTab(Tab.Swap);
                        setSearchParams((params) => {
                            params.set("tab", Tab.Swap);
                            return params;
                        });
                    }}
                    description="Swap"
                    active={tab === Tab.Swap}
                />
            </Tabs>
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 20 }}>
                {tab === Tab.Buy && (
                    <div className={styles.darkBuy}>
                        {/* <div style={{ width: 375, height: 667 }} ref={containerRef}></div> */}
                        <iframe
                            height="625"
                            title="Transak On/Off Ramp Widget"
                            src={`https://global.transak.com/?apiKey=${RAMP_TRANSAK_API_KEY}&defaultCryptoCurrency=ETH&defaultFiatAmount=500&disableWalletAddressForm=true&network=arbitrum&walletAddress=${currentWallet}`}
                            frameBorder={"no"}
                            allowTransparency={true}
                            allowFullScreen={true}
                            style={{ display: "block", width: "100%", maxHeight: "625px", maxWidth: "500px" }}
                        ></iframe>
                    </div>
                )}
                {tab === Tab.Bridge && SOCKET_API_KEY && (
                    <Bridge
                        provider={isWeb3Auth ? provider : signer?.provider}
                        onSourceNetworkChange={(network) => {
                            setChainId(network.chainId);
                        }}
                        onBridgeSuccess={reloadBalances}
                        API_KEY={SOCKET_API_KEY}
                        defaultSourceToken={"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"}
                        defaultDestToken={"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"}
                        // enableSameChainSwaps
                        singleTxOnly
                        // enableRefuel
                        includeBridges={[
                            "polygon-bridge",
                            "hop",
                            "anyswap-router-v4",
                            "hyphen",
                            "arbitrum-bridge",
                            "connext",
                            "celer",
                            // "across",
                            "optimism-bridge",
                            "refuel-bridge",
                        ]}
                        defaultSourceNetwork={1}
                        defaultDestNetwork={defaultChainId}
                        sourceNetworks={[1, defaultChainId]}
                        destNetworks={[1, defaultChainId]}
                        customize={lightMode ? lightSocketTheme : darkSocketTheme}
                    />
                )}
                {tab === Tab.Swap && SOCKET_API_KEY && (
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
                        provider={websocketProvider || wagmiSigner?.provider}
                        onConnectWalletClick={connectWallet}
                        onTxSuccess={reloadBalances}
                        tokenList={uniswapTokens}
                        permit2={true}
                    />
                )}
            </div>
        </div>
    );
};

export default Exchange;
