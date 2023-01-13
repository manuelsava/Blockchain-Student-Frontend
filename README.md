# Student dApp #



## Prerequisites ##



1. Download latest stable [NodeJs](https://nodejs.org/it/)
2. Verify npm:
```bash
npm -version
```
3. Install [Metamask extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) in your browser, and select the "show testnet networks" option in settings.
Specifically, you are going to use the ropsten and the localhost networks



## Start-Up ##



1. Download all dependencies (on repository root folder):
```bash
npm install
```
2. Start React App with production environment:
```bash
npm run start
```
3. Start React App with local environment:
```bash
npm run local
```




## Configuration ##



Set up your local Backend host by changing in **.env-cdmrc.json** the property **REACT_APP_API** under field **development**. By default, the **production** fields are set to the deployed **heroku** API.
In order to create NFTs, an [NFT.STORAGE](https://nft.storage/) key is required. Place your personal key in the fields **REACT_APP_NFT_STORAGE** in the same file.




## Run ##



Login with your Metamask wallet pointing on the network you choose in your backend.




## Build ##



1. Short develop:
```bash
npm run build
```
2. With profile Production:
```bash
npm run build env-cmd -e production
```