import { useState, useEffect, useMemo } from "react";
import { useMoralis } from "react-moralis";
import InchModal from "./components/InchModal";
import useInchDex from "hooks/useInchDex";
import { Button, Card, Image, Input, InputNumber, Modal } from "antd";
import Text from "antd/lib/typography/Text";
import { ArrowDownOutlined } from "@ant-design/icons";
import { useTokenPrice } from "react-moralis";
import { tokenValue } from "helpers/formatters";
import { getWrappedNative } from "helpers/networks";

import { ethers } from "ethers";
import contract from "../../utils/contract.json";

const styles = {
	card: {
		width: "430px",
		// boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
		border: "1px solid #e7eaf3",
		borderRadius: "1rem",
		fontSize: "16px",
		fontWeight: "500",
		borderColor: "transparent",
	},
	input: {
		padding: "0",
		fontWeight: "500",
		fontSize: "23px",
		display: "block",
		width: "100%",
	},
	priceSwap: {
		display: "flex",
		justifyContent: "space-between",
		fontSize: "18px",
		color: "#616161",
		marginTop: "25px",
		padding: "0 10px",
	},
};

const nativeAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const chainIds = {
	"0x1": "eth",
	"0x38": "bsc",
	"0x89": "polygon",
	"0x80001": "mumbai",
};

const getChainIdByName = (chainName) => {
	for (let chainId in chainIds) {
		if (chainIds[chainId] === chainName) return chainId;
	}
};

const IsNative = (address) => address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

/* wrapped ether on eth mainnet
{
		"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
			address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
			decimals: 18,
			logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
			name: "Wrapped Ether",
			symbol: "ETH",
		},
}
wrapped ether polygong mainnet
{
		"0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": {
			address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
			decimals: 18,
			logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
			name: "Wrapped Ether",
			symbol: "WETH",
		},
	},
0xd393b1e02da9831ff419e22ea105aae4c47e1253

	customTokens = {
		"0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7": {
			address: "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7",
			decimals: 18,
			logoURI: "https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734",
			name: "fDAI",
			symbol: "fDAI",
		},
*/
function DEX({
	chain = "mumbai",
	customTokens = {
		"0x15f0ca26781c3852f8166ed2ebce5d18265cceb7": {
			address: "0x15f0ca26781c3852f8166ed2ebce5d18265cceb7",
			decimals: 18,
			logoURI: "https://assets.coingecko.com/coins/images/9956/small/4943.png?1636636734",
			name: "fDAI",
			symbol: "fDAI",
		},
		"0x07979aEdb43DC042171bB1BE8A0DeF4F64DC4A9e": {
			address: "0x07979aEdb43DC042171bB1BE8A0DeF4F64DC4A9e",
			decimals: 6,
			logoURI: "https://assets.coingecko.com/coins/images/22910/small/zip.png?1642949795",
			name: "PIMP",
			symbol: "PIMP",
		},
	},
}) {
	const { trySwap, tokenList, getQuote } = useInchDex(chain);

	const { Moralis, isInitialized, chainId } = useMoralis();
	const [isFromModalActive, setFromModalActive] = useState(false);
	const [isToModalActive, setToModalActive] = useState(false);

  const [successModal, setSuccessModal] = useState(false); 
	const [fromToken, setFromToken] = useState();
	// fromToken used for Price checks only, use fromTokenMumbai for swap
	// const [fromTokenMumbai, setFromTokenMumbai] = useState();

	const [toToken, setToToken] = useState();
	const [fromAmount, setFromAmount] = useState();
	const [quote, setQuote] = useState();
	const [currentTrade, setCurrentTrade] = useState();
	const { fetchTokenPrice } = useTokenPrice();
	const [tokenPricesUSD, setTokenPricesUSD] = useState({});

	const tokens = useMemo(() => {
		return { ...customTokens, ...tokenList };
	}, [customTokens, tokenList]);

	const fromTokenPriceUsd = useMemo(
		() => (tokenPricesUSD?.[fromToken?.["address"]] ? tokenPricesUSD[fromToken?.["address"]] : null),
		[tokenPricesUSD, fromToken]
	);

	const toTokenPriceUsd = useMemo(
		() => (tokenPricesUSD?.[toToken?.["address"]] ? tokenPricesUSD[toToken?.["address"]] : null),
		[tokenPricesUSD, toToken]
	);

	const fromTokenAmountUsd = useMemo(() => {
		if (!fromTokenPriceUsd || !fromAmount) return null;
		return `~USD$ ${(fromAmount * fromTokenPriceUsd).toFixed(4)}`;
	}, [fromTokenPriceUsd, fromAmount]);

	// eslint-disable-next-line
	const toTokenAmountUsd = useMemo(() => {
		if (!toTokenPriceUsd || !quote) return null;
		return `~$ ${(Moralis?.Units?.FromWei(quote?.toTokenAmount, quote?.toToken?.decimals) * toTokenPriceUsd).toFixed(4)}`;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toTokenPriceUsd, quote]);

	// tokenPrices fromToken
	useEffect(() => {
		if (!isInitialized || !fromToken || !chain) return null;
		// const validatedChain = chain ? getChainIdByName(chain) : chainId;
		// manually set chainId
		const validatedChain = "0x89";
		// const tokenAddress = IsNative(fromToken["address"]) ? getWrappedNative(validatedChain) : fromToken["address"];
		// manually set tokenAddress
		const tokenAddress = "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063";
		fetchTokenPrice({
			params: { chain: validatedChain, address: tokenAddress },
			onSuccess: (price) =>
				setTokenPricesUSD({
					...tokenPricesUSD,
					[fromToken["address"]]: price["usdPrice"],
				}),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chain, isInitialized, fromToken]);

	// tokenPrices toToken
	useEffect(() => {
		if (!isInitialized || !toToken || !chain) return null;
		// const validatedChain = chain ? getChainIdByName(chain) : chainId;
		// const tokenAddress = IsNative(toToken["address"]) ? getWrappedNative(validatedChain) : toToken["address"];
		// fetchTokenPrice({
		// 	params: { chain: validatedChain, address: tokenAddress },
		// 	onSuccess: (price) =>
		// 		setTokenPricesUSD({
		// 			...tokenPricesUSD,
		// 			[toToken["address"]]: price["usdPrice"],
		// 		}),
		// });
		setTokenPricesUSD({
			...tokenPricesUSD,
			[toToken["address"]]: "1.000000",
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chain, isInitialized, toToken]);

	useEffect(() => {
		if (!tokens || fromToken) return null;
		setFromToken(tokens[nativeAddress]);
	}, [tokens, fromToken]);

	// setting from token manually + setting to token manually
	useEffect(() => {
		setFromToken(customTokens["0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7"]);
		setToToken(customTokens["0x07979aEdb43DC042171bB1BE8A0DeF4F64DC4A9e"]);
	}, []);

	const ButtonState = useMemo(() => {
		// if (chainIds?.[chainId] !== chain)
		//   return { isActive: false, text: `Switch to ${chain}` };

		if (!fromAmount) return { isActive: false, text: "Enter an amount" };
		// if (fromAmount && currentTrade) return { isActive: true, text: "Swap" };
		return { isActive: true, text: "Pledge" };
		// return { isActive: false, text: "Select tokens" };
	}, [fromAmount, currentTrade, chainId, chain]);

	useEffect(() => {
		if (fromToken && toToken && fromAmount) setCurrentTrade({ fromToken, toToken, fromAmount, chain });
	}, [toToken, fromToken, fromAmount, chain]);

	// useEffect(() => {
	// 	if (currentTrade) getQuote(currentTrade).then((quote) => setQuote(quote));
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [currentTrade]);

	const fundContract = async () => {
		const wad = parseFloat(fromAmount) * 10 ** 18;
    console.log(wad)

    const contractAddress = "0x07979aEdb43DC042171bB1BE8A0DeF4F64DC4A9e"; 
		if (window.ethereum) {
      //let abiApprove = ["function fund(address _spender, uint256 _value) public returns (bool success)"]
      let abi = contract.abi
      console.log(abi)
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			let userAddress = await signer.getAddress();
			console.log(userAddress);

      const sparkFundContract = new ethers.Contract(contractAddress, abi, signer); 
      //const sparkFundContract1 = new ethers.Contract(contractAddress, abiApprove, signer); 

			// const approval = await sparkFundContract.approve(userAddress, fromAmount);

			const tx = await sparkFundContract.fund(`${wad}`); 
      setSuccessModal(true) 
		}

	};

	return (
		<>
			<Card style={styles.card} bodyStyle={{ padding: "20px" }}>
				<h1 style={{ padding: "0.3rem" }}>Fund</h1>
				<Card style={{ borderRadius: "1rem" }} bodyStyle={{ padding: "0.8rem" }}>
					<div style={{ marginBottom: "5px", fontSize: "14px", color: "#434343" }}>Pledge Amount</div>
					<div
						style={{
							display: "flex",
							flexFlow: "row nowrap",
						}}
					>
						<div>
							<InputNumber
								bordered={false}
								placeholder="0.00"
								style={{ ...styles.input, marginLeft: "-10px" }}
								onChange={setFromAmount}
								value={fromAmount}
							/>
							<Text style={{ fontWeight: "600", color: "#434343" }}>{fromTokenAmountUsd}</Text>
						</div>
						<Button
							style={{
								height: "fit-content",
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								borderRadius: "0.6rem",
								padding: "5px 10px",
								fontWeight: "500",
								fontSize: "17px",
								gap: "7px",
								border: "none",
							}}
							onClick={() => setFromModalActive(true)}
						>
							{fromToken ? (
								<Image
									src={fromToken?.logoURI || "https://etherscan.io/images/main/empty-token.png"}
									alt="nologo"
									width="30px"
									preview={false}
									style={{ borderRadius: "15px" }}
								/>
							) : (
								<span>Select a token</span>
							)}
							<span>{fromToken?.symbol}</span>
							<Arrow />
						</Button>
					</div>
				</Card>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						paddingTop: "20px",
					}}
				>
					<ArrowDownOutlined />
				</div>
				<h1 style={{ padding: "0.3rem", paddingTop: "0" }}>Get</h1>
				<Card style={{ borderRadius: "1rem" }} bodyStyle={{ padding: "0.8rem" }}>
					<div style={{ marginBottom: "5px", fontSize: "14px", color: "#434343" }}>Token Allotment</div>
					<div
						style={{
							display: "flex",
							flexFlow: "row nowrap",
						}}
					>
						<div>
							<Input
								bordered={false}
								placeholder="0.00"
								style={styles.input}
								readOnly
								value={
									fromTokenAmountUsd && (parseFloat(fromAmount) * 100).toFixed(2)
									// quote
									//   ? parseFloat(
									//       Moralis?.Units?.FromWei(
									//         quote?.toTokenAmount,
									//         quote?.toToken?.decimals,
									//       ),
									//     ).toFixed(6)
									//   : ""
								}
							/>
							<Text style={{ fontWeight: "600", color: "#434343" }}>
								{fromTokenAmountUsd && `Stake ~ ${(((parseFloat(fromAmount) * 100).toFixed(2) / 160000) * 100).toFixed(2)}%`}
							</Text>
						</div>
						<Image
							src={toToken?.logoURI || "https://etherscan.io/images/main/empty-token.png"}
							alt="nologo"
							width="25px"
							height="25px"
							preview={false}
							style={{
								borderRadius: "15px",
								display: "flex",
								alignItems: "left",
							}}
						/>
						<Text
							style={{
								fontWeight: "600",
								color: "#434343",
								marginLeft: "12px",
								fontSize: "18px",
							}}
						>
							PIMP
						</Text>
					</div>
				</Card>
				<Text style={styles.priceSwap}>
					{" "}
					<span style={{ fontWeight: 600 }}>Conversion: </span>1 $DAI = 100 $PIMP
				</Text>
				<Button
					type="primary"
					size="large"
					style={{
						width: "100%",
						marginTop: "15px",
						borderRadius: "0.6rem",
						height: "50px",
					}}
					onClick={fundContract}
					disabled={!ButtonState.isActive}
				>
					{ButtonState.text}
				</Button>
			</Card>
			<Modal
				title="Select a token"
				visible={isFromModalActive}
				onCancel={() => setFromModalActive(false)}
				bodyStyle={{ padding: 0 }}
				width="450px"
				footer={null}
				zIndex="1400"
			>
				<InchModal open={isFromModalActive} onClose={() => setFromModalActive(false)} setToken={setFromToken} tokenList={tokens} />
			</Modal>

      <Modal
				title="✅ Transaction successful"
				visible={successModal}
				onCancel={() => setSuccessModal(false)}
				bodyStyle={{ padding: 0 }}
				width="450px"
				footer={null}
				zIndex="1400"
			>
        <h1 style={{margin: "20px", fontSize: "20px"}}>You funded {fromAmount} $DAI for {fromAmount * 100} $PIMP!</h1>
			</Modal>
		</>
	);
}

export default DEX;

const Arrow = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		strokeWidth="2"
		stroke="currentColor"
		fill="none"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path stroke="none" d="M0 0h24v24H0z" fill="none" />
		<polyline points="6 9 12 15 18 9" />
	</svg>
);
