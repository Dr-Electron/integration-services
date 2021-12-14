"use strict";(self.webpackChunkiota_wiki=self.webpackChunkiota_wiki||[]).push([[7601],{63533:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return i},contentTitle:function(){return l},metadata:function(){return d},toc:function(){return h},default:function(){return c}});var n=a(83117),o=a(80102),s=(a(67294),a(3905)),r=["components"],i={title:"Data Transfer",description:"A major use-case for the IOTA Technology is Data Transfer. Learn how it works."},l="Data Transfer",d={unversionedId:"about-iota/data-transfer",id:"about-iota/data-transfer",title:"Data Transfer",description:"A major use-case for the IOTA Technology is Data Transfer. Learn how it works.",source:"@site/internal/learn/about-iota/data-transfer.md",sourceDirName:"about-iota",slug:"/about-iota/data-transfer",permalink:"/integration-services/learn/about-iota/data-transfer",editUrl:"https://github.com/iota-community/iota-wiki/edit/main/internal/learn/about-iota/data-transfer.md",tags:[],version:"current",lastUpdatedAt:1638141545,formattedLastUpdatedAt:"11/28/2021",frontMatter:{title:"Data Transfer",description:"A major use-case for the IOTA Technology is Data Transfer. Learn how it works."},sidebar:"learn",previous:{title:"An Introduction to IOTA",permalink:"/integration-services/learn/about-iota/an-introduction-to-iota"},next:{title:"Value Transfer",permalink:"/integration-services/learn/about-iota/value-transfer"}},h=[{value:"Data Usage",id:"data-usage",children:[],level:2},{value:"What is an IOTA message?",id:"what-is-an-iota-message",children:[],level:2},{value:"Sending a message in IOTA",id:"sending-a-message-in-iota",children:[],level:2},{value:"Message structure",id:"message-structure",children:[{value:"Message validation",id:"message-validation",children:[],level:3},{value:"Payloads",id:"payloads",children:[],level:3}],level:2}],u={toc:h};function c(e){var t=e.components,a=(0,o.Z)(e,r);return(0,s.kt)("wrapper",(0,n.Z)({},u,a,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"data-transfer"},"Data Transfer"),(0,s.kt)("p",null,"IOTA offers the ability to transfer Data for free. The Data transfer is fast, immutable, unforgeable, and secure and is one of the core features of IOTA. This capability opens up a wide array of use cases that most other cryptocurrencies cannot serve in a way that IOTA does."),(0,s.kt)("p",null,"In IOTA, clients like wallets or applications send and receive messages (data objects) through nodes. Nodes are the entry and exit points for these messages, and they communicate with each other and with the connected clients."),(0,s.kt)("p",null,"There are several types of messages implemented in IOTA. Some transfer value (the IOTA token or digital assets), while others transfer no value, but pure Data and other types can contain both. This enables the decentralized transport of Data and Value in a single message with the highest security grade and the total absence of fees. The nodes of the network take care of the secure distribution of all messages in the Tangle."),(0,s.kt)("h2",{id:"data-usage"},"Data Usage"),(0,s.kt)("p",null,"Many applications and use cases can profit from this combination of free, secure, and fast data and value transport, which is a demand in all major industries. Read more about IOTA Data use cases ",(0,s.kt)("a",{parentName:"p",href:"https://www.iota.org/solutions/industries"},"here"),"."),(0,s.kt)("h2",{id:"what-is-an-iota-message"},"What is an IOTA message?"),(0,s.kt)("p",null,"A message is an object consisting of information that is broadcasted in the Tangle."),(0,s.kt)("p",null,"Every application that uses the protocol is free to issue these information objects to a node. The job of an Iota node is to verify and broadcast all these information objects through the network if they are valid and follow the standards of the protocol."),(0,s.kt)("p",null,'If a node decides that a message is valid, it will send it to its neighbors using the gossip protocol. Every neighbor that receives the message transfers it again to its neighbors and so on. Very quickly, every other node in the network sees the message and has the same information and the same knowledge of the "State" of the network at a given time.'),(0,s.kt)("p",null,"A Message consists of basic information that defines the type and structure of the message, and it can also contain different ",(0,s.kt)("strong",{parentName:"p"},"Payloads"),". A Payload is an attachment that can include an IOTA transaction and many other kinds of data."),(0,s.kt)("p",null,"The IOTA protocol categorizes these information packages into different types and handles certain types differently than others. Therefore, every message sent to the network must contain a unique label as an identifier that describes exactly what this message is and what should be done with it. Only with this information \"printed\" on the 'label', a node will accept and process a message. This can be understood as similar to filling out a label before sending a package using your local postal service."),(0,s.kt)("p",null,"A more detailed description of this process on the protocol level can be found ",(0,s.kt)("a",{parentName:"p",href:"https://github.com/iotaledger/protocol-rfcs/blob/33570042d8f2241ecc9a9104f5eb38fbf4bc3c95/text/0017-message/0017-message.md"},"here"),"."),(0,s.kt)("h2",{id:"sending-a-message-in-iota"},"Sending a message in IOTA"),(0,s.kt)("p",null,"Messages are created by so-called clients. This can be an IOTA wallet or any other application that can generate IOTA messages. The client sends those messages to an IOTA node to process them."),(0,s.kt)("p",null,"To make sure that a message is valid and a node knows what to do with the message, the message label created by a client must provide several pieces of information for the node to be processed and enter the network."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Message ID")),(0,s.kt)("p",null,"The message ID is created as a unique cryptographic hash out of the bytes contained in the message. It is created by the client (application) or wallet that issues the message."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Network ID")),(0,s.kt)("p",null,"An identification in which IOTA network the message belongs (Mainnet / Testnet / private network) - Nodes will only accept messages that identify themself as part of the network the node belongs to."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Parents length and Parents ID")),(0,s.kt)("p",null,'This is the amount and the identifier of the messages which are referenced by the new message. To build up the graph structure of the Tangle, every new message in the Tangle must reference 2 - 8 previous messages. The node selects those two messages and sends the IDs to the client, and the client must include this information into the message "label."'),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Payload length")),(0,s.kt)("p",null,"As messages in IOTA are not allowed to exceed a size of 32kb, the message must declare the size of its payload to the node... like you would need to report the weight of a package if you want to send it with a courier in advance."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Payload type")),(0,s.kt)("p",null,"A definition of which kind of payload is contained in the message. The Node needs to know this, as some payload types need to be handled differently than others."),(0,s.kt)("p",null,(0,s.kt)("strong",{parentName:"p"},"Nonce")),(0,s.kt)("p",null,"That is the nonce that lets this message fulfill the Proof-of-Work requirement. Proof of work is mainly done locally on the device that issues the message and is a form of spam protection. But it can also be done by the node if the node allows this. That is a very useful feature as it enables very low-powered devices to issue messages (like sensors, chips, etc.) Those sensors can send a message to a node that allows messages without already performed POW, and then the POW is done by the node (which is usually running on a more powerful device). This is one of the key features of the protocol and the reason why IOTA is so suitable for IoT and Data applications. So users who want to issue many data messages from a huge amount of extremely low-power devices only need to connect those devices to a node that allows them to do the POW for them (which will be, in most cases, their own node). As the POW requirement is extremely low, it is no problem to do this even for a large number of devices for a node."),(0,s.kt)("p",null,"A side note - in the upcoming 2.0 IOTA version, this POW requirement will become adaptive and is planned to be completely removed for times of normal network loads... Read more about IOTA 2.0 ",(0,s.kt)("a",{parentName:"p",href:"/build/networks/iota-2.0"},"here"),"."),(0,s.kt)("h2",{id:"message-structure"},"Message structure"),(0,s.kt)("p",null,"This is the defined outer structure of every message in the IOTA protocol (the label of our package):"),(0,s.kt)("table",null,(0,s.kt)("tr",null,(0,s.kt)("th",null,"Name"),(0,s.kt)("th",null,"Type"),(0,s.kt)("th",null,"Description")),(0,s.kt)("tr",null,(0,s.kt)("td",null,"NetworkID"),(0,s.kt)("td",null,"uint64"),(0,s.kt)("td",null,"Network identifier. This field will signify whether this message was meant for mainnet, testnet, or a private net. It also tells what protocol rules apply to the message. It is the first 8 bytes of the `BLAKE2b-256` hash of the concatenation of the network type and the protocol version string.")),(0,s.kt)("tr",null,(0,s.kt)("td",null," Parents' length "),(0,s.kt)("td",null," uint8"),(0,s.kt)("td",null," The number of messages we directly approve. Can be any value between 1-8.")),(0,s.kt)("tr",null,(0,s.kt)("td",null,"Parents "),(0,s.kt)("td",null,"ByteArray[32 * `parents length`]"),(0,s.kt)("td",null,"The Message IDs that are referenced.")),(0,s.kt)("tr",null,(0,s.kt)("td",null,"Payload Length"),(0,s.kt)("td",null,"uint32"),(0,s.kt)("td",null," The length of the Payload. Since its type may be unknown to the node it must be declared in advance. 0 length means no payload will be attached.")),(0,s.kt)("tr",null,(0,s.kt)("td",{colspan:"1"},"Payload"),(0,s.kt)("td",{colspan:"2"},(0,s.kt)("details",{open:"true"},(0,s.kt)("summary",null,"Generic Payload"),(0,s.kt)("blockquote",null,"An outline of a general payload"),(0,s.kt)("table",null,(0,s.kt)("tr",null,(0,s.kt)("th",null,"Name"),(0,s.kt)("th",null,"Type"),(0,s.kt)("th",null,"Description")),(0,s.kt)("tr",null,(0,s.kt)("td",null,"Payload Type"),(0,s.kt)("td",null,"uint32"),(0,s.kt)("td",null,"The type of the payload. It will instruct the node on how to parse the fields that follow.")),(0,s.kt)("tr",null,(0,s.kt)("td",null,"Data Fields"),(0,s.kt)("td",null,"ANY"),(0,s.kt)("td",null,"A sequence of fields, where the structure depends on ",(0,s.kt)("code",null,"payload type"),".")))))),(0,s.kt)("tr",null,(0,s.kt)("td",null,"Nonce"),(0,s.kt)("td",null,"uint64"),(0,s.kt)("td",null,"The nonce which lets this message fulfill the Proof-of-Work requirement."))),(0,s.kt)("p",null,"All this information must be created by a client (wallet software or other programs that generate IOTA messages) to issue a message to a node and make sure the node knows what to do with this message."),(0,s.kt)("h3",{id:"message-validation"},"Message validation"),(0,s.kt)("p",null,"A message is considered valid if the following syntactic rules are met:"),(0,s.kt)("ol",null,(0,s.kt)("li",{parentName:"ol"},"The message size must not exceed 32 KiB (32 ","*"," 1024 bytes)."),(0,s.kt)("li",{parentName:"ol"},"Analyzing the Syntax structure of the message (parsing) does not leave any unknown bits - this means that all the message information is fully readable by the node... unreadable information could contain malicious code and is therefore denied."),(0,s.kt)("li",{parentName:"ol"},"If the payload type is known to the node."),(0,s.kt)("li",{parentName:"ol"},"If the Message PoW Hash indicates that the minimum requirements of POW requested by the network or the node have been fulfilled."),(0,s.kt)("li",{parentName:"ol"},"Number of parent messages must be between 1-8.")),(0,s.kt)("p",null,"The message will only be accepted for processing if these parameters are met and readable by the node."),(0,s.kt)("h3",{id:"payloads"},"Payloads"),(0,s.kt)("p",null,"A message may contain a payload. Three payload types are currently defined in the mainnet, but developers can create their custom payloads and attach them to messages as long as they fit the general requirements. This means an IOTA message can contain many types of information, and the IOTA Token as transaction payload is just one of many. Below is a table of the currently specified core payloads with a link to their specifications."),(0,s.kt)("table",null,(0,s.kt)("thead",{parentName:"table"},(0,s.kt)("tr",{parentName:"thead"},(0,s.kt)("th",{parentName:"tr",align:null},"Payload Name"),(0,s.kt)("th",{parentName:"tr",align:null},"Type Value"))),(0,s.kt)("tbody",{parentName:"table"},(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:null},(0,s.kt)("a",{parentName:"td",href:"https://github.com/luca-moser/protocol-rfcs/blob/signed-tx-payload/text/0000-transaction-payload/0000-transaction-payload.md"},"Transaction Payload")),(0,s.kt)("td",{parentName:"tr",align:null},"0")),(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:null},(0,s.kt)("a",{parentName:"td",href:"https://github.com/jakubcech/protocol-rfcs/blob/jakubcech-milestonepayload/text/0019-milestone-payload/0019-milestone-payload.md"},"Milestone Payload")),(0,s.kt)("td",{parentName:"tr",align:null},"1")),(0,s.kt)("tr",{parentName:"tbody"},(0,s.kt)("td",{parentName:"tr",align:null},(0,s.kt)("a",{parentName:"td",href:"https://github.com/GalRogozinski/protocol-rfcs/blob/message/text/0017-message/0017-message.md#indexation-payload"},"Indexation Payload")),(0,s.kt)("td",{parentName:"tr",align:null},"2")))),(0,s.kt)("p",null,"A message containing only an ",(0,s.kt)("strong",{parentName:"p"},"indexation payload")," (Data) can be sent without a signature. It can hold any data the user wants to send, as long as it is parsable and follows the required syntax and size limit."),(0,s.kt)("p",null,"The message is specified by an ",(0,s.kt)("strong",{parentName:"p"},"index"),", which will make it possible for any users to find this message and the containing Data by searching the network for this index."),(0,s.kt)("p",null,"As you may have recognized, a message in the IOTA network does not need a specific receiver. All messages in the network are propagated to all nodes and are visible to every network user. Also, the Data Payload (if not encrypted by the sender) is visible for everyone that sees the message. If you want to send a Data message using the IOTA protocol that should only be visible to a selected group of receivers, the IOTA Streams framework is built precisely for this purpose. It will enable a direct gateway to receivers and encrypt the information from everyone else in the network. Read more about IOTA Streams here:"),(0,s.kt)("p",null,"A ",(0,s.kt)("strong",{parentName:"p"},"Data message"),", which is defined as an indexation Payload, can be easily found by everyone who knows that message's index. If you want to send an arbitrary message or sensitive data, you need to tell the receiver which index you are using. He can observe the network for all messages containing this index using an explorer."),(0,s.kt)("p",null,"In a ",(0,s.kt)("strong",{parentName:"p"},"value transaction"),', the payment receiver - an IOTA address - will be specified in the "signed transaction payload" field. Then, only the owner of that specific address can use the contained funds by unlocking them with the private key that belongs to that receiving address. Read more about how sending value transactions in IOTA work here: ',(0,s.kt)("a",{parentName:"p",href:"/learn/about-iota/value-transfer"},"value transfer")))}c.isMDXComponent=!0},3905:function(e,t,a){a.d(t,{Zo:function(){return h},kt:function(){return p}});var n=a(67294);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function r(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?s(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):s(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,o=function(e,t){if(null==e)return{};var a,n,o={},s=Object.keys(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)a=s[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a])}return o}var l=n.createContext({}),d=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):r(r({},t),e)),a},h=function(e){var t=d(e.components);return n.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,o=e.mdxType,s=e.originalType,l=e.parentName,h=i(e,["components","mdxType","originalType","parentName"]),c=d(a),p=o,m=c["".concat(l,".").concat(p)]||c[p]||u[p]||s;return a?n.createElement(m,r(r({ref:t},h),{},{components:a})):n.createElement(m,r({ref:t},h))}));function p(e,t){var a=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var s=a.length,r=new Array(s);r[0]=c;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:o,r[1]=i;for(var d=2;d<s;d++)r[d]=a[d];return n.createElement.apply(null,r)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"}}]);