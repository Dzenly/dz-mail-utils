'use strict';
var crypto = require('crypto');
var fs = require('fs');

// 2048 bit.
var privKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAyQLYByZAnfKxK/8bpR31AphamgiUODEzOpdKykFaUMGWXz1/
/4SnKR68GkPIwei5BSwgox6+6cqHWQedrNzDFI0pF0/6tJuZ1V8OUz8aWMAFudcN
LvSCnhKE4dj57HO3Fuv00YhPxgCfxTz70cvTAXSf0XeUTm32J1lj21ZD+DnLX2fb
klr2Gvq3Dm//AWsntvL6yHXTDUc5aTKpMlIGqpuVTzJXOr8/Zy/Aqijkj38Wzo/E
gfgLSVL/f3vwtO51Gusr8b47tvYAqwkQt63vJxf7v5m7ZLWTswsup2hNGQSkDoTY
rjVDvexXkOCXAy7FtXhQlcEJwQxc7efe9Ydm0wIDAQABAoIBABdJJQ1u+P1TKAMY
wnMWTVPHondFlyYLTQv0is1zVKsWQf02eqV3EIZK8S95ur/73bMjsYQ0A5nBxHwj
zbhAuriewavZsAlMHT4CjP5HyR2O4RruNrDB0n/NVWd0Yz9pCES3gNzlFZiyac/H
iMR9ACyi/gCeAag0RNe6Gz9FdwpCMyMLEISVMEroqC2mnpiSHwe9x3JJ18u2ac6t
R29TFcjKgJnl50G0uEfU2JWshF6bm3kEVTzBwoKoaeMZd5UW44Mszc3IsnSKvAWT
DovLyecVjwcvz1gjj8DmVInoRNItkFYQNRis6oL6snxFaD72ap1SdkSEyF3kiudR
A5WNV8ECgYEA5+TFPTw5yKq9/p+96Hj1wnjhUirXNo3zSy15yhtLa7jI0VDQ+Uy9
BX2RSoiAaWH7k/Zk7SkX5k/MeOIqtSU66yXc9+XcncuilsdNe5XGw7SkNInCIaGQ
LfmRueF/HXKqWJO4VtkrLhtFkRQHZiEYlcSdrK3C19XwMuvXjuMqZqUCgYEA3eg3
rKU+9Mk5piVcs48tp0UwtUrCsEWo/OX4VAJwcp66cMKLaQDB9PiNc+NxHKhBFKCa
lGkYR1rPNQd9HNuOBbTXreO86/jokhKznuHkR6y88jYmsGx0tbEtM3vVznRd/JaQ
yL+pIlFHXdtEZvUDymLKVXDtTicZtZzFwwluFhcCgYEAjukxGST1o5J+Vt6RhiSN
qNUgX6ghS/C9gJY9GW4q0+9ka4M31nwRfcG9+cYYBVoqViyiVHpfzUNeix0vHsYc
AnEqNeiGRwUJZYzcVo6emVvJWsuPRXSxS3Qj9/9dfIN/MemP0I40C00pWViTmsBI
y3wJhDLuAmBJkMhB50BekDUCgYEAnVDsb1Oy3xzs5rGkF5PQnL37evrmLMslsyxh
sUUNbOTEbf4tkSI9Xqr6tQawAM3zXWlCTSZ4VNW3AfQuKVApTjhXkupZ27xZPH1P
o7qm+H0oclobcYVh9BEIZ3BKMhPjMZeYSwk9IZwXiR1ST98xccA5ivsE8RvdKRhc
RxmfVr8CgYAsfjuJXAk58qZpZUGXBY5LKcqGw7FWaZNXJ/52LHLCgcD0jnA5Dukg
Gg0gEvc6BLOBxxA3ggJrLxMKI0wtig/Ig4YpNdzBNHCNAMhrPfDJyl4l4YGZjUId
9ceDTT84xuV49UgrEyIXbsdQq0LccbeMJ2pxeuUMQuwWGKEc0PKnAA==
-----END RSA PRIVATE KEY-----`;

var pubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyQLYByZAnfKxK/8bpR31
AphamgiUODEzOpdKykFaUMGWXz1//4SnKR68GkPIwei5BSwgox6+6cqHWQedrNzD
FI0pF0/6tJuZ1V8OUz8aWMAFudcNLvSCnhKE4dj57HO3Fuv00YhPxgCfxTz70cvT
AXSf0XeUTm32J1lj21ZD+DnLX2fbklr2Gvq3Dm//AWsntvL6yHXTDUc5aTKpMlIG
qpuVTzJXOr8/Zy/Aqijkj38Wzo/EgfgLSVL/f3vwtO51Gusr8b47tvYAqwkQt63v
Jxf7v5m7ZLWTswsup2hNGQSkDoTYrjVDvexXkOCXAy7FtXhQlcEJwQxc7efe9Ydm
0wIDAQAB
-----END PUBLIC KEY-----`;

var inputBuf = crypto.randomBytes(256-41);
console.log(inputBuf.length);

var encryptedBuf = crypto.publicEncrypt({key: pubKey, padding: crypto.constants.RSA_PKCS1_PADDING}, inputBuf);
// Error: error:040A006E:rsa routines:RSA_padding_add_PKCS1_OAEP_mgf1:data too large for key size

console.log(encryptedBuf.length);

// var decryptedBuf = crypto.privateDecrypt(privKey, encryptedBuf);


