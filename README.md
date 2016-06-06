CampaignBuildTool npm script
======================================================================
Campaign 專案開發前端自動化流程工具 [自動化流程 step by step](https://hackmd.io/s/S1ohqCzN)
此版本為 Campaign 開發用，其他專案類型需視狀況調整 package.json 及 task  
有任何問題請用 issues 提出或是 pull resuest

## 功能
#### 檔案結構
- images/sprite
- style-edit.css
- Photoshop 輸出圖片自動歸檔至專案資料夾

#### 開發
- <del>瀏覽器 liveload、多平台測試</del>
- 自動產出 sprite
- 圖片壓縮
- CSS 合併、最佳化、壓縮

#### 使用 package
* <del>browsersync</del>
* <del>ngrok</del>
* nodemon
* postcss
	- sprites
	- imagemin(pngquant+jpeg-recompress)
	- autoprefixer
	- nano

## 使用
1. 請先安裝 [Node.js][d51f406f]、 [git for Window][2502918c]、[InitBuildTool][3]
2. clone 此專案
3. 設定 package.json 及 task/*.js
> package.json - 修改 watch:image path
> task - 修改 imagefolder output path

4. Sublime Text 執行 InitBuildTool
[d51f406f]: https://nodejs.org/en/ "Node.js"
[2502918c]: https://git-scm.com/ "git for Window"
[3]: https://github.com/isobartw-dev/InitBuildTool "InitBuildTool"

## 指令
``install package`` - 安裝 package.json 專案需要的 package，並且產生自動化需要的檔案及資料夾  
``update package`` - 更新 package  
``watch`` - 圖片規檔、編譯 CSS 產生 sprite 
``watch:sprite`` - 和 watch 類似，用於修改 
``deploy`` - commit 前檔案最佳化

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
