## [0.7.1](https://github.com/ekino/node-config/compare/v0.7.0..v0.7.1) - 2026-07-10

### Bug Fixes

- Correct get() return type and add getValue overloads for string paths - ([437b75b](https://github.com/ekino/node-config/commit/437b75b399c3f1563cb444da343d9ce3b4d77617))

### Miscellaneous Tasks

- *(release)* V0.7.1 - ([1cb05d4](https://github.com/ekino/node-config/commit/1cb05d42e41a65b64601ca9327fa7cb6838c59da))

## [0.7.0](https://github.com/ekino/node-config/compare/v1.0.0..v0.7.0) - 2026-06-26

### Features

- *(2.0)* Use best practice for tsconfig.json - ([6e71ba3](https://github.com/ekino/node-config/commit/6e71ba306541e5a81829cc6ffc3581e28cd08943))
- Support array type - ([0eaab03](https://github.com/ekino/node-config/commit/0eaab03ac98a4abbea5efa11b9a3d3a3fa120483))
- Stop supporting node20 (EOL) - ([8a5ed6c](https://github.com/ekino/node-config/commit/8a5ed6c8c3a313ab70ce9e9d9e35eb1482f22abd))
- Support minimum node.js version to 20 - ([38afa83](https://github.com/ekino/node-config/commit/38afa837175b1235cb5d59c7dc8d84d890ee1a00))
- Support dual package common.js and ESM - ([3f7a977](https://github.com/ekino/node-config/commit/3f7a977c738edb55e04a89c48cc7280326339eb4))
- Convert to ESM - ([be10260](https://github.com/ekino/node-config/commit/be1026090d23499ed24d56c21acef03dd6bee56a))
- Remove lodash, write custom native methods - ([6ed4f61](https://github.com/ekino/node-config/commit/6ed4f61c0e854dc7088d54fe78b5b1fd017222b1))

### Bug Fixes

- Add explicit types field for TypeScript 6 compatibility - ([5cd45e8](https://github.com/ekino/node-config/commit/5cd45e83aa8e3770a6e2b25fb8935c29760d424f))
- Capture internals.merge return value instead of relying on mutation - ([69a0291](https://github.com/ekino/node-config/commit/69a0291722f76edf5d5dd6d0078cb0a4b4132574))
- Replace unsafe cast in isAdvancedConfig with typeof check - ([ad5dd1a](https://github.com/ekino/node-config/commit/ad5dd1abff4f46341abde8b7a1fcf4f623459767))
- Align cast signature in Internals type with its implementation - ([12393fb](https://github.com/ekino/node-config/commit/12393fbd3708ee7da53b9415ef2223ca6aaf7826))
- Correct dead guard in unsetValue null-traversal check - ([41d121a](https://github.com/ekino/node-config/commit/41d121a584af879878e89e0451716308f5254930))
- Give correct behavior for getValue, setValue, mergeWith methods - ([3b61652](https://github.com/ekino/node-config/commit/3b61652cc5193ef35eee88747a8ff557c2878be8))

### Documentation

- Update contributing - ([c292918](https://github.com/ekino/node-config/commit/c2929180dc4b0a1a0ae6d333d8b52effe8c7ce6d))

### Testing

- Complete utils tests for improve coverage and show coverage summary - ([cbb467f](https://github.com/ekino/node-config/commit/cbb467f1cc053b56e3249f80ddecdb37e0e096c5))
- Remove unused import - ([e9e1544](https://github.com/ekino/node-config/commit/e9e1544c4c0ccc005d57c11a85c9e94c71740531))
- Complete all unit tests for utils methods - ([bf3f3cd](https://github.com/ekino/node-config/commit/bf3f3cdd70ec55abb2209745cc6823aa3b01e349))
- Convert jest to vitest - ([17446c6](https://github.com/ekino/node-config/commit/17446c6cf3206eafb2905e5d7741bc6cec1f2a20))

### Miscellaneous Tasks

- *(2.0)* Active lint-check before creating a commit - ([8726f99](https://github.com/ekino/node-config/commit/8726f992a9a085f9182dec35b484ee9518823d93))
- *(2.0)* Simplify npm by using files fields, remove .npmignore - ([13bd3d3](https://github.com/ekino/node-config/commit/13bd3d36419eea06dc1ca5412871ea3d93dd39bf))
- *(2.0)* Move index to src folder for better management project - ([17aa1da](https://github.com/ekino/node-config/commit/17aa1dada4af2a63ce153c7278865eedfc815596))
- *(2.0)* Use biome, remove eslint + prettier - ([d31218d](https://github.com/ekino/node-config/commit/d31218d1d2eca868be3e60d88e181517f0e4b850))
- *(2.0)* Upgrade eslint 9.x and use flat config - ([57681b1](https://github.com/ekino/node-config/commit/57681b1606730b8101c8345b0d5b55f716b5c5de))
- *(2.0)* Upgrade conventional-changelog-cli 5 - ([7cf3197](https://github.com/ekino/node-config/commit/7cf31977688ffaf3deaed502febb23937a6ea3d2))
- *(2.0)* Upgrade prettier,remove plugin prettier eslint, reformat all files - ([c50e6ff](https://github.com/ekino/node-config/commit/c50e6ff355ff66a703fe40a7b59522d20cc69947))
- *(2.0)* Remove husky, use native githooks - ([9c84099](https://github.com/ekino/node-config/commit/9c8409930ec9ad8ff4b66a24ec90d0126cae7edb))
- *(2.0)* Upgrade to yarn 4.5 - ([61ce1c2](https://github.com/ekino/node-config/commit/61ce1c2bc0e1be0b99555fe12ef99baa9cc50670))
- *(changelog)* Remove new contributors parts that is not correct - ([8ed188f](https://github.com/ekino/node-config/commit/8ed188f6c5fbf474de2d8bb9339a5840f2704177))
- *(hook)* Use pnpm to run command - ([433df2e](https://github.com/ekino/node-config/commit/433df2eb201e882ba8a3531cc3d623bb87412328))
- *(release)* V0.7.0 - ([7bffc0e](https://github.com/ekino/node-config/commit/7bffc0e65fe2d3290d0554896ee25559f240d4e3))
- *(release)* Change yarn compile by yarn tsc - ([230a6e0](https://github.com/ekino/node-config/commit/230a6e007a9b5b24af69dff5e0bacd89231ed0e6))
- *(tsconfig)* Fix missings extends issues for tsconfig lib - ([c527a8b](https://github.com/ekino/node-config/commit/c527a8b1bdc7773b1a4503df3bc05671d1b3b7b0))
- *(tsconfig)* Add more options - ([c2f8a0b](https://github.com/ekino/node-config/commit/c2f8a0bee0f8bf3d67d2f4829aaf37762ee09a1d))
- *(utils)* Remove unncessary methods - ([5686dd6](https://github.com/ekino/node-config/commit/5686dd62f67651166d2e65e630f631b6228e536c))
- Use pnpm 11 and support node 26 - ([0ab4dde](https://github.com/ekino/node-config/commit/0ab4dde477c1b87f0f091caf94c48b83ce615791))
- Remove incorrect syntax, enforce strict admin users for npm release - ([07e9a4a](https://github.com/ekino/node-config/commit/07e9a4aab56e1f75254c033da5e071e73f370989))
- Use trusted publisher OIDC based flow for release npm - ([dabec50](https://github.com/ekino/node-config/commit/dabec50cbeeefc95edb14b7b746d02dd81906bed))
- Clean up tsconfig for TypeScript 6 defaults and deprecations - ([2315902](https://github.com/ekino/node-config/commit/2315902a4710f96398cffdc08e63b7fd84392f8d))
- Update dependencies - ([143bea3](https://github.com/ekino/node-config/commit/143bea3a8217e6a905c82f8fe49c4e4bc66a565c))
- Use node 24 version to run release - ([cf1fd57](https://github.com/ekino/node-config/commit/cf1fd5722058868dc89baeca09ecd952e3fdab86))
- Add contributing rules - ([2e7f823](https://github.com/ekino/node-config/commit/2e7f82383a4c886aaf9468d62d9bfd03af93136c))
- Rename lint-check command to check - ([371035d](https://github.com/ekino/node-config/commit/371035dd10f98926e9b57b1b29cd43cc52cb4a6f))
- Rename global types to @types - ([0a2d22a](https://github.com/ekino/node-config/commit/0a2d22a391edd82fcbcc1da1032913e874fb1f30))
- Remove yarn.lock - ([1dedf0c](https://github.com/ekino/node-config/commit/1dedf0c1a2e6f3c4f3ada37675f64cedc11db831))
- Remove deprecated links: travis CI, prettier - ([6452f06](https://github.com/ekino/node-config/commit/6452f063777cb0db80c1ce9e3b7d48cf19efdd82))
- Add issue templates - ([cd0bb31](https://github.com/ekino/node-config/commit/cd0bb318e349260e94860281f6e3e69befd797c8))
- Generate changelog by git-cliff - ([c2840cb](https://github.com/ekino/node-config/commit/c2840cbe9d7967a75a267cb169035a1222b25d7e))
- Update CI systems, run by pnpm - ([1d325f6](https://github.com/ekino/node-config/commit/1d325f6dcb7daeb179244aa6878c8b636c75bbea))
- Setup 18.x as minimal nodejs - ([f977aee](https://github.com/ekino/node-config/commit/f977aee0922c931104e8d4ad31ebe72cef27e7e3))
- Remplace yarn by pnpm - ([83a62f8](https://github.com/ekino/node-config/commit/83a62f80b2aef26f06abda97421506a57a3317be))

## 1.0.0 (2021-05-07)

-   chore(actions): add codeQL actions ([3d9352c](https://github.com/ekino/node-config/commit/3d9352c))
-   chore(actions): change pre release token to launch action ([b0485e1](https://github.com/ekino/node-config/commit/b0485e1))
-   chore(deps): bump acorn from 5.7.3 to 5.7.4 ([0fd3735](https://github.com/ekino/node-config/commit/0fd3735))
-   chore(deps): bump lodash from 4.17.15 to 4.17.19 ([0db8550](https://github.com/ekino/node-config/commit/0db8550))
-   chore(publishing): use github actions to publish ([0d6ad6a](https://github.com/ekino/node-config/commit/0d6ad6a))
-   chore(release): change base branch to master ([a592697](https://github.com/ekino/node-config/commit/a592697))
-   chore(release): don't delete release branch ([caea4e3](https://github.com/ekino/node-config/commit/caea4e3))
-   chore(yarn): Add missing yarn version plugin ([c0e7161](https://github.com/ekino/node-config/commit/c0e7161))
-   chore(yarn): migrate to yarn v2 ([203e433](https://github.com/ekino/node-config/commit/203e433))
-   fix(workflow): remove typo in folder name ([3071701](https://github.com/ekino/node-config/commit/3071701))

### [0.6.3](https://github.com/ekino/node-config/compare/v0.6.1...v0.6.3) (2020-01-15)

### Bug Fixes

-   **changelog:** fix changelog generation ([0c8c7ba](https://github.com/ekino/node-config/commit/0c8c7bae784461ac92bc837943e74ae33cce6b18))

### [0.6.1](https://github.com/ekino/node-config/compare/v0.5.0...v0.6.1) (2020-01-15)

### Features

-   **packaging:** remove useless files from npm package ([c4cdf40](https://github.com/ekino/node-config/commit/c4cdf402bd94462467f23900cbf7742d0781da2f))
-   **test:** migrate to jest ([9130277](https://github.com/ekino/node-config/commit/91302772ecbc23f8d4ad0cce621a682f1bda501e))
-   **typescript:** migrate to typescript ([6f2ea8f](https://github.com/ekino/node-config/commit/6f2ea8f4f5176ab1c81400dd03b888ce0f29f167))

## [0.5.0](https://github.com/ekino/node-config/compare/v0.2.0...v0.5.0) (2019-12-18)

### Features

-   **ci:** replace flowdock notification with slack ([b891f16](https://github.com/ekino/node-config/commit/b891f16bb1dcf14a0528790f1ee36b5894472d14))
-   **typescript:** add typescript definitions ([#12](https://github.com/ekino/node-config/issues/12)) ([f949b3c](https://github.com/ekino/node-config/commit/f949b3cdafe8074d6c334da0c11b8b42aa3d97a7))
-   remove NODE_ENV and CONF_OVERRIDE in favor of CONF_DIR and CONF_FILES + support .yaml and .yml extensions ([06d68a7](https://github.com/ekino/node-config/commit/06d68a7bcc472b37b9f92f7345bdd8349ae5fbf5))
-   **overrides:** add ability to define extra overrides ([ed1f0d5](https://github.com/ekino/node-config/commit/ed1f0d5a750ad7b10d9845394313c09bc13890d4))

### Bug Fixes

-   **doc:** Fix package.json repo url ([27c71ae](https://github.com/ekino/node-config/commit/27c71aef9fcfbfb8f54bcc291617e185ba4c86cb))
-   **format:** add .prettierrc to .npmignore ([2b9a3eb](https://github.com/ekino/node-config/commit/2b9a3eb25615621d1c66ae9aaee77ffe07189606))
-   **test:** exclude helpers folder from test ([38b85bd](https://github.com/ekino/node-config/commit/38b85bde25b4476633a65a457a74f465a044facf))
-   **test:** fix es6 export style for ava configuration ([b8d5248](https://github.com/ekino/node-config/commit/b8d5248a3b77c743a9d99dee3a39e3c70fbc8734))

## [0.2.0](https://github.com/ekino/node-config/compare/v0.1.0...v0.2.0) (2017-06-23)

### Features

-   **cast:** Adding support for env value boolean casting. ([6764dd3](https://github.com/ekino/node-config/commit/6764dd36d655ac7ef8f0196f61358117236dac97))

## 0.1.0 (2017-06-09)
