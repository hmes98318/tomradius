# server

version: `0.3.0`  

Session 使用 RAM 儲存, 不使用 DB  

API請求回傳結構
```ts
{
    "loadType": LoadType;
    "data": object[];
}
```