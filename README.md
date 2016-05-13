ISOBAR TW 前端自動化建置工具
===============================
此版本為 Campaign 開發用，其他專案需視狀況調整 package.json 及 task  
有任何問題請用 issues 提出或是 pull resuest

## 功能
#### 檔案結構
1. images/sprite
2. style_edit.css
3. output 圖片自動歸檔資料夾

#### 開發
1. 瀏覽器 liveload、多平台測試
2. 自動產出 sprite
3. 圖片壓縮
4. CSS 合併、最佳化、壓縮

## 環境及工具
* Node.js
  * npm script
* git
* Sublime Text

## package
* browsersync
* ngrok
* nodemon
* postcss
  * sprites
  * imagemin(pngquant+jpeg-recompress)
  * autoprefixer
  * clean

## 使用方法
1. 安裝 [Node.js][d51f406f] 及 [git for Window][2502918c]
2. clone 此專案
3. 設定 package.jaon 及 task/*.js
>package.json - 修改 watch:image path  
>task - 修改 imagefolder output path 

4. Sublime Text 執行 Init Build Tool
[d51f406f]: https://nodejs.org/en/ "Node.js"
[2502918c]: https://git-scm.com/ "git for Window"

## CMD指令
``npm install`` - 安裝 package.josn 專案需要的 package，並且產生自動化需要的檔案及資料夾  
``npm run watch`` - 編譯檔案、圖片規檔  
``npm run dev`` - debug 用    
``npm run deploy`` - commit 前檔案最佳化

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
>sprite 圖檔：css selector-sprite_sprite檔名 ex. btn-sprite_misc  
>轉換成 jpg：檔名_jpg
