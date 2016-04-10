ISOBAR TW 前端自動化建置工具
===============================
此版本為 Campaign 開發用，其他專案需視狀況調整 package.json 及 task  
有任何問題請用 issues 提出或是 pull resuest

## 功能
#### 檔案結構
1. images/sprite
2. style_edit.css
3. output 圖片自動歸檔

#### 開發
1. 瀏覽器自動預覽(PC) 多平台測試
2. 自動產出 sprite
3. 圖片壓縮
4. CSS 合併 最佳化 壓縮

## 環境及工具
* Node.js
  * npm script
* git

## package
* browsersync
* watch
* postcss
  * sprites
  * imagemin
  * autoprefixer
  * clean

## 使用方法
1. 安裝 [Node.js][d51f406f] 及 [git for Window][2502918c]
2. clone 或 下載此專案
3. 設定 package.jaon 及 task/*.js

>package.json - 修改 ngrok port 及 watch:image path  
>task - imagefolder output path
[d51f406f]: https://nodejs.org/en/ "Node.js"
[2502918c]: https://git-scm.com/ "git for Window"

## CMD指令
``npm install`` - 安裝 package.josn 專案需要的package  
``npm run build`` - 產生自動化需要的檔案及資料夾  
``npm run dev`` - 測試及監聽檔案  
``npm run deploy`` - commit或發布

## 圖檔命名規則
```
版本-[檔名 | css selector-sprite_sprite檔名 | 檔名_jpg].*
```  
``
版本
``  
>PC：不用下  
>mobile：mobile  

``檔名``
>一般圖檔：檔名  
>sprite圖檔：css selector-sprite_sprite檔名 ex. btn-sprite_misc  
>轉換成jpg：檔名_jpg
