export enum Network {
  POLYGON_AMOY = "polygon-amoy",
  POLYGON = "polygon",
  ETHEREUM_SEPOLIA = "ethereum-sepolia",
  ETHEREUM = "ethereum",
  ARBITRUM = "arbitrum",
  BASE = "base",
  ETHERLINK = "etherlink",
  ETHERLINK_TESTNET = "etherlink-testnet",
  ZKSYNC = "zksync",
  ZKSYNC_SEPOLIA = "zksync-sepolia",
}

export const getNetworkUrl = () => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

  switch (network) {
    case Network.POLYGON:
      return "https://polygon-rpc.com/";
    case Network.POLYGON_AMOY:
      return "https://rpc-amoy.polygon.technology/";
    case Network.ETHEREUM_SEPOLIA:
      return "https://eth-sepolia.g.alchemy.com/v2/jFhSITUli6T64wkYjl6B89O1S4p9xUmw";
    case Network.ETHEREUM:
      return "https://eth-mainnet.g.alchemy.com/v2/jFhSITUli6T64wkYjl6B89O1S4p9xUmw";
    case Network.ARBITRUM:
      return "https://arb1.arbitrum.io/rpc";
    case Network.BASE:
      return "https://mainnet.base.org";
    case Network.ETHERLINK:
      return "https://node.mainnet.etherlink.com";
    case Network.ETHERLINK_TESTNET:
      return "https://node.ghostnet.etherlink.com";
    case Network.ZKSYNC:
      return "https://mainnet.era.zksync.io";
    case Network.ZKSYNC_SEPOLIA:
      return "https://zksync-era-sepolia.blockpi.network/v1/rpc/public";
    default:
      return "https://mainnet.base.org";
  }
};

export const getChainId = () => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

  switch (network) {
    case Network.POLYGON:
      return 137;
    case Network.POLYGON_AMOY:
      return 80002;
    case Network.ETHEREUM_SEPOLIA:
      return 11155111;
    case Network.ZKSYNC:
      return 324;
    case Network.ZKSYNC_SEPOLIA:
      return 300;
    case Network.ETHEREUM:
      return 1;
    case Network.ARBITRUM:
      return 42161;
    case Network.BASE:
      return 8453;
    case Network.ETHERLINK:
      return 42793;
    case Network.ETHERLINK_TESTNET:
      return 128123;
    default:
      return 8453; // Default to Base
  }
};

export const getNetworkToken = () => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

  switch (network) {
    case Network.POLYGON_AMOY:
    case Network.POLYGON:
      return "MATIC";
    case Network.ETHEREUM:
    case Network.ETHEREUM_SEPOLIA:
    case Network.ARBITRUM:
    case Network.BASE:
    case Network.ZKSYNC:
    case Network.ZKSYNC_SEPOLIA:
      return "ETH";
    case Network.ETHERLINK:
    case Network.ETHERLINK_TESTNET:
      return "XTZ";
    default:
      return "ETH";
  }
};

export const getFaucetUrl = () => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  switch (network) {
    case Network.POLYGON_AMOY:
      return "https://faucet.polygon.technology/";
    case Network.ETHEREUM_SEPOLIA:
      return "https://sepoliafaucet.com/";
    case Network.ETHERLINK_TESTNET:
      return "https://faucet.etherlink.com/";
    case Network.ZKSYNC_SEPOLIA:
      return "https://faucet.quicknode.com/ethereum/sepolia";
    default:
      return undefined;
  }
};

export const getNetworkName = () => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  switch (network) {
    case Network.POLYGON:
      return "Polygon (Mainnet)";
    case Network.POLYGON_AMOY:
      return "Polygon (Amoy)";
    case Network.ETHEREUM_SEPOLIA:
      return "Ethereum (Sepolia)";
    case Network.ETHEREUM:
      return "Ethereum (Mainnet)";
    case Network.ARBITRUM:
      return "Arbitrum";
    case Network.BASE:
      return "Base";
    case Network.ETHERLINK:
      return "Etherlink (Mainnet)";
    case Network.ETHERLINK_TESTNET:
      return "Etherlink (Testnet)";
    case Network.ZKSYNC:
      return "zkSync (Mainnet)";
    case Network.ZKSYNC_SEPOLIA:
      return "zkSync (Sepolia)";
    default:
      return "Base";
  }
};

export const getBlockExplorer = (address: string) => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;

  switch (network) {
    case Network.POLYGON:
      return `https://polygonscan.com/address/${address}`;
    case Network.POLYGON_AMOY:
      return `https://www.oklink.com/amoy/address/${address}`;
    case Network.ETHEREUM:
      return `https://etherscan.io/address/${address}`;
    case Network.ETHEREUM_SEPOLIA:
      return `https://sepolia.etherscan.io/address/${address}`;
    case Network.ARBITRUM:
      return `https://arbiscan.io/address/${address}`;
    case Network.BASE:
      return `https://basescan.org/address/${address}`;
    case Network.ETHERLINK:
      return `https://explorer.etherlink.com/address/${address}`;
    case Network.ETHERLINK_TESTNET:
      return `https://testnet-explorer.etherlink.com/address/${address}`;
    case Network.ZKSYNC:
      return `https://explorer.zksync.io/address/${address}`;
    case Network.ZKSYNC_SEPOLIA:
      return `https://sepolia.explorer.zksync.io/address/${address}`;
    default:
      return `https://basescan.org/address/${address}`;
  }
};

export const isEip1559Supported = () => {
  const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK;
  switch (network) {
    case Network.ETHEREUM_SEPOLIA:
    case Network.ETHEREUM:
    case Network.ARBITRUM:
    case Network.BASE:
      return true;
    case Network.ZKSYNC:
    case Network.ZKSYNC_SEPOLIA:
    case Network.POLYGON:
    case Network.POLYGON_AMOY:
    case Network.ETHERLINK:
    case Network.ETHERLINK_TESTNET:
      return false;
    default:
      return true;
  }
};
