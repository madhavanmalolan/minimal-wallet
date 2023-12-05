# Minimal Viable Wallet

Super experimental, don't use for anything meaningful

## Key considerations
- Mobile first
- Throwaway Wallets per dapp instead of global accounts
- No swap bloatware
- Fast

## Opinions
- Browser extensions suck max, too big a security & privacy hole
- Primary action is scan WalletConnect QR as soon as you open the app
- Asset management (aka storing value / trading) to be separated from onchain transactions 
- If you want to transact on a new dapp, create a new address, send tokens to the new address and then interact. Additional step, i know - but better than status quo
- Full control on RPC used, different accounts on same chain can use different RPCs for better security (via hedging) & privacy
- An account on MVW is a tuple of (keys, chain, rpc)
- No swap, send-receive on the app - connect to a website with that functionality like uniswap and use that UI instead

## Running locally
`npm install`

create project on `cloud.walletconnect.org`
set project id in `.env` for variable `WC_PROJECTID`

`npx expo start`

