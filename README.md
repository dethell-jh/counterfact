
<div align="right">

[![Coverage Status](https://coveralls.io/repos/github/pmcelhaney/counterfact/badge.svg)](https://coveralls.io/github/pmcelhaney/counterfact) [![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fpmcelhaney%2Fcounterfact%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/pmcelhaney/counterfact/main) ![MIT License](https://img.shields.io/badge/license-MIT-blue) 


</div>

<div align="center">

# Counterfact

_Front end development without back end headaches_




[Watch Demo](#watch-demo) | [Quick Start](#quick-start) |  [Documentation](#documentation) | [Support](#support)



</div>



<div align="center">
Counterfact is a stand-in REST server powered by Node, TypeScript, and OpenAPI.<br>It simulates complex, stateful back end behavior without running the whole stack.
</div>

<br>

<table align="center" cols="2">

<tr>
<td>

💪 build the UI before the API or build both in parallel<br>
🏎️ quickly and cheaply prototype UX workflows<br>
🎉 turn OpenAPI docs into functional code

</td>

<td>

⛓️ write fast, repeatable UI integration tests<br>
🧑‍🔬 test UI code against hard-to-recreate edge cases<br>
🔌 plug into your existing toolchain

</td>

</tr>

</table>


<div id="watch-demo" align="center">

```





     video will go here




```
</div>


## Quick Start

Try it now with one command. The only prequisite is Node 16+. 

```sh copy
npx counterfact@latest https://petstore3.swagger.io/api/v3/openapi.json api --open
```

### What does it do?

1. installs the `@latest` version of `counterfact`
2. reads an [OpenAPI 3](https://oai.github.io/Documentation/) document (`https://petstore3.swagger.io/api/v3/openapi.json`)
3. generates TypeScript files in the `api` directory
4. starts a server which implements the API
5. opens your browser to [Swagger UI](https://swagger.io/tools/swagger-ui/) (`--open`)

You can use Swagger to try out the auto-generated API. Out of the box, it returns random responses using metadata from the OpenAPI document. You can edit the files under `./api/paths` to add more realistic behavior. There's no need to restart the server.


## Documentation

Coming soon!


## Support

Counterfact is brand new as of October 3, 2022. Please send feedback / questions to pmcelhaney@gmail.com or [create a new issue](https://github.com/pmcelhaney/counterfact/issues/new). If you like what you see, please give this project a star! 
