CampaignBuildTool npm script
======================================================================
初次使用請先看[自動化流程 step by step](https://hackmd.io/s/S1ohqCzN)  
Campaign 專案開發前端自動化流程工具  
此版本為 Campaign 開發用，其他專案類型需視狀況調整 package.json 及 task  
有任何問題請用 issues 提出或是 pull resuest

## 功能
#### 檔案結構
- images/sprite
- css/sass(_*.css)
- css/style-edit.css

#### 開發
- 瀏覽器 liveload、多平台測試
- 自動產出 sprite
- 圖片壓縮
- CSS 合併、最佳化、壓縮
- Photoshop 輸出圖片自動歸檔至專案資料夾

#### 使用 package
* browsersync
* ngrok
* onchange
* postcss
	- sprites
	- imagemin(pngquant+jpeg-recompress+gifsicle+svgo)
	- autoprefixer
	- nano
	- clean
	- css-mqpacker

## 使用
1. 請先安裝 [Node.js][d51f406f]、 [git for Window][2502918c]、[InitBuildTool][3]
2. clone 此工具包或 git pull 更新工具包
3. Sublime Text 執行 InitBuildTool

[d51f406f]: https://nodejs.org/en/ "Node.js"
[2502918c]: https://git-scm.com/ "git for Window"
[3]: https://github.com/isobartw-dev/InitBuildTool "InitBuildTool"

#### 指令
```install package``` - 安裝 package.json 專案需要的 package，並且產生自動化需要的檔案及資料夾  
```update package``` - 更新 package  
```runIIS``` - 產生本機網站(localhost)  
```watch``` - 圖片規檔(watch:image)、編譯 CSS 產生 sprite(watch:css)  
```dev``` - 開發、抓蟲模式(結合 watch 指令)  
```deploy``` - commit 前圖檔(deploy:image)、CSS(deploy:css) 最佳化  

#### 圖檔命名規則
```
版本-[檔名 | css selector-sprite_sprite檔名 | 檔名_jpg].副檔名	
```  
``
版本
``  
>PC：不用下  
>mobile：mobile  

``檔名``
>一般圖檔：檔名  
>sprite 用圖檔：css selector-sprite_sprite檔名 ex. btn-sprite_misc  
>轉換成 jpg：檔名_jpg
