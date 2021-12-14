"use strict";(self.webpackChunkiota_wiki=self.webpackChunkiota_wiki||[]).push([[1259],{2158:function(e,n,t){t.r(n),t.d(n,{frontMatter:function(){return l},contentTitle:function(){return s},metadata:function(){return c},toc:function(){return u},default:function(){return d}});var r=t(83117),a=t(80102),i=(t(67294),t(3905)),o=["components"],l={},s="Configuration",c={unversionedId:"installation/kubernetes/configuration",id:"installation/kubernetes/configuration",title:"Configuration",description:"In this section are reported all the configuration parameters that can be used.",source:"@site/external/integration-services/documentation/docs/installation/kubernetes/configuration.md",sourceDirName:"installation/kubernetes",slug:"/installation/kubernetes/configuration",permalink:"/integration-services/integration-services/installation/kubernetes/configuration",tags:[],version:"current",frontMatter:{},sidebar:"docs",previous:{title:"Expose APIs",permalink:"/integration-services/integration-services/installation/kubernetes/expose_apis"},next:{title:"Decentralized Indentity Examples",permalink:"/integration-services/integration-services/examples/intro_identity"}},u=[{value:"Database",id:"database",children:[],level:3},{value:"Secrets",id:"secrets",children:[],level:3},{value:"Number of replicas",id:"number-of-replicas",children:[],level:3},{value:"Ingress Hostname",id:"ingress-hostname",children:[],level:3},{value:"Private Tangle",id:"private-tangle",children:[],level:3}],p={toc:u};function d(e){var n=e.components,t=(0,a.Z)(e,o);return(0,i.kt)("wrapper",(0,r.Z)({},p,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("h1",{id:"configuration"},"Configuration"),(0,i.kt)("p",null,"In this section are reported all the configuration parameters that can be used.\nAll values must be changed before deployment.\nIn case a deployment is already running you can apply again your configuration and run again the following commands:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre"},"$ kubectl apply -f integration-services/kubernetes/optional\n$ kubectl apply -f integration-services/kubernetes\n")),(0,i.kt)("h3",{id:"database"},"Database"),(0,i.kt)("p",null,"You can connect Integration Service APIs to any MongoDB database specifying in file ",(0,i.kt)("inlineCode",{parentName:"p"},"kubernetes/is-config.yaml"),":"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"DATABASE_URL")," with the connection string "),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"DATABASE_NAME")," with the database name")),(0,i.kt)("p",null,"Default value references a single-instance MongoDB instance that is deployed\nusing ",(0,i.kt)("inlineCode",{parentName:"p"},"kubernetes/optional/mongo-*.yaml")," files in the ",(0,i.kt)("inlineCode",{parentName:"p"},"default")," namespace."),(0,i.kt)("h3",{id:"secrets"},"Secrets"),(0,i.kt)("p",null,"Integration Services APIs are protected by a fixed api key. Moreover data on database are encrypted using a server key. "),(0,i.kt)("p",null,"Both those key are defined in ",(0,i.kt)("inlineCode",{parentName:"p"},"is-secrets.yaml"),": those values are base64 encoded so you can obtain them with the following:"),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"echo -n ...SERVER_SECRET_KEY or API_KEY... | base64")),(0,i.kt)("p",null,"Current values are:"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"PpKFhPKJY2efTsN9VkB7WNtYUhX9Utaa")," as ",(0,i.kt)("inlineCode",{parentName:"li"},"SERVER_SECRET")," and "),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"94F5BA49-12B6-4E45-A487-BF91C442276D")," as ",(0,i.kt)("inlineCode",{parentName:"li"},"API_KEY"))),(0,i.kt)("h3",{id:"number-of-replicas"},"Number of replicas"),(0,i.kt)("p",null,"You can setup initial number of replicas in the ",(0,i.kt)("inlineCode",{parentName:"p"},".spec.replicas")," field in ",(0,i.kt)("inlineCode",{parentName:"p"},"kubernetes/is-deployment.yaml")," file."),(0,i.kt)("h3",{id:"ingress-hostname"},"Ingress Hostname"),(0,i.kt)("p",null,"In case you are accessing service via Ingress resource you can set the\ndomain name in ",(0,i.kt)("inlineCode",{parentName:"p"},"kubernetes/optional/ingress.yaml")," (default is ",(0,i.kt)("inlineCode",{parentName:"p"},"ensuresec.solutions.iota.org"),")."),(0,i.kt)("h3",{id:"private-tangle"},"Private Tangle"),(0,i.kt)("p",null,"You can reference your own private IOTA node (either from mainnet tangle or a private one)\nchanging in ",(0,i.kt)("inlineCode",{parentName:"p"},"kubernetes/is-config.yaml")," the fields ",(0,i.kt)("inlineCode",{parentName:"p"},"IOTA_PERMA_NODE")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"IOTA_HORNET_NODE")))}d.isMDXComponent=!0},3905:function(e,n,t){t.d(n,{Zo:function(){return u},kt:function(){return f}});var r=t(67294);function a(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function o(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){a(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,a=function(e,n){if(null==e)return{};var t,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(a[t]=e[t]);return a}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var s=r.createContext({}),c=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):o(o({},n),e)),t},u=function(e){var n=c(e.components);return r.createElement(s.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},d=r.forwardRef((function(e,n){var t=e.components,a=e.mdxType,i=e.originalType,s=e.parentName,u=l(e,["components","mdxType","originalType","parentName"]),d=c(t),f=a,m=d["".concat(s,".").concat(f)]||d[f]||p[f]||i;return t?r.createElement(m,o(o({ref:n},u),{},{components:t})):r.createElement(m,o({ref:n},u))}));function f(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var i=t.length,o=new Array(i);o[0]=d;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:a,o[1]=l;for(var c=2;c<i;c++)o[c]=t[c];return r.createElement.apply(null,o)}return r.createElement.apply(null,t)}d.displayName="MDXCreateElement"}}]);