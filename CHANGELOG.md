<a name="0.2.1"></a>
## 0.2.1 (2017-06-07)


### Bug Fixes

* **account:** update prepareLastOrder ([d894b54](https://github.com/awitherow/coinbot/commit/d894b54))
* **account:** use proper order matches ([b65fad2](https://github.com/awitherow/coinbot/commit/b65fad2))
* **advisor:** extract twilio to purify advisor ([68fcdf5](https://github.com/awitherow/coinbot/commit/68fcdf5))
* **coinbot:** correct snapshot ([2f0f2d8](https://github.com/awitherow/coinbot/commit/2f0f2d8))
* **decision:** only fulfill sale or purchase ([38a416b](https://github.com/awitherow/coinbot/commit/38a416b))
* **match:** last match does not necessarily reflect truth ([2b9d619](https://github.com/awitherow/coinbot/commit/2b9d619))
* **twilio:** create and send message according to docs ([3ef892f](https://github.com/awitherow/coinbot/commit/3ef892f))


### Features

* **accounts:** enable split match processing ([3b803d8](https://github.com/awitherow/coinbot/commit/3b803d8))
* **advisor:** cover sell cases ([315742f](https://github.com/awitherow/coinbot/commit/315742f))
* **advisor:** purchase when no coins && has money ([8f495b8](https://github.com/awitherow/coinbot/commit/8f495b8))
* **client:** separation of duties ([eea594c](https://github.com/awitherow/coinbot/commit/eea594c))
* **coinbot:** iterate over each coin ([4a94874](https://github.com/awitherow/coinbot/commit/4a94874))
* **coinbot:** psuedocode all functions ([b2d6230](https://github.com/awitherow/coinbot/commit/b2d6230))
* **coinbot:** reactivate based on coin ([fe2b3f5](https://github.com/awitherow/coinbot/commit/fe2b3f5))
* **coinbot:** smart coin type collection ([043e4d3](https://github.com/awitherow/coinbot/commit/043e4d3))
* **coinbot:** try catch with reactivate on failure ([155c0b1](https://github.com/awitherow/coinbot/commit/155c0b1))
* **decisions:** decide when user has no coins but has currency ([c834271](https://github.com/awitherow/coinbot/commit/c834271))
* **flow:** init ([92801f1](https://github.com/awitherow/coinbot/commit/92801f1))
* **index:** add initial first connection ([d9d7402](https://github.com/awitherow/coinbot/commit/d9d7402))
* **logger:** add notice logging for semi-rise/fall ([d90cc7b](https://github.com/awitherow/coinbot/commit/d90cc7b))
* **node:** update to v7.8.0 for native async/await ([673b93e](https://github.com/awitherow/coinbot/commit/673b93e))
* **product:** add 24 hour stats function ([6ab38f3](https://github.com/awitherow/coinbot/commit/6ab38f3))
* **readme:** add badass badge ([4ff1be7](https://github.com/awitherow/coinbot/commit/4ff1be7))
* **sale:** create basic sales advisory check ([ddefa8e](https://github.com/awitherow/coinbot/commit/ddefa8e))
* **trade:** enable custom currency trade via env ([955a865](https://github.com/awitherow/coinbot/commit/955a865))


### Performance Improvements

* **coinbot:** use promise.all for concurrency ([4ee4234](https://github.com/awitherow/coinbot/commit/4ee4234))



