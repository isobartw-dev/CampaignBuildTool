# project-dev-tool npm script

初次使用請先看[自動化流程 step by step](https://hackmd.io/s/S1ohqCzN)  
專案開發前端自動化流程工具  
有任何問題請用 issues 提出或是 pull resuest

## 注意

- 請升級至 Node Ver.10 以上
- 更名後 v1.0、v2.0 的 package.json 請更改 `repository` `bugs` `homepage` 的網址
- v2.0 更新項目
- 使用 v1.0 precss 開發的專案，請下載 v1.0 版本至專案使用 (之後會停用)

## 功能

#### 檔案結構

```
images/
|– sprite/
|   |– *-sprite_text.png

css/
|– style.css


sass/
|
|– utilities/
|   |– variables.scss    // Sass Variables
|   |– functions.scss    // Sass Functions
|   |– mixins.scss       // Sass Mixins
|
|– base/
|   |– reset.scss        // Reset/normalize
|   |– text.scss         // Typography rules
|
|– components/
|   |– buttons.scss      // Buttons
|   |– carousel.scss     // Carousel
|
|– layout/
|   |– navigation.scss   // Navigation
|   |– grid.scss         // Grid system
|   |– header.scss       // Header
|   |– footer.scss       // Footer
|   |– forms.scss        // Forms
|
|– pages/
|   |– home.scss         // Home specific styles
|   |– about.scss        // About specific styles
|   |– contact.scss      // Contact specific styles
|
|– themes/
|   |– theme.scss        // Default theme
|   |– admin.scss        // Admin theme
|
|– vendors/
|   |– bootstrap.scss    // Bootstrap
|   |– jquery-ui.scss    // jQuery UI
|
|– style-edit.scss       // Main Sass file

source-map/
|– css/
|   |– style.css.map
|– mobile/
|   |– css/
|      |– style.css.map
```

#### 開發

- 瀏覽器 liveload、多平台測試
- 自動產出 sprite
- 圖片壓縮
- CSS 合併、最佳化、壓縮
- Photoshop 輸出圖片自動歸檔至專案資料夾


2. clone 此工具包或 git pull 更新工具包
3. Sublime Text 執行 InitBuildTool

[d51f406f]: https://nodejs.org/en/ 'Node.js'
[2502918c]: https://git-scm.com/ 'git for Window'
[3]: https://github.com/isobartw-dev/InitBuildTool 'InitBuildTool'

#### 指令

`install package` - 安裝 package.json 專案需要的 package，並且產生自動化需要的檔案及資料夾  
`update package` - 更新 package  
`runIIS` - 產生本機網站(localhost)  
`watch` - 圖片規檔(watch:image)、編譯 CSS 產生 sprite(watch:css)  
`dev` - 開發、抓蟲模式(結合 watch 指令)  
`min` - commit 前圖檔(min:image)、CSS(min:css) 最佳化

#### 圖檔命名規則

```
版本-[檔名 | 檔名-資料夾名稱_ | css selector-sprite_sprite檔名 | 檔名_jpg].副檔名
```

`版本`

> PC：不用下  
> mobile：mobile

`檔名`

> 一般圖檔：檔名  
> images 中的資料夾圖檔：檔名-資料夾名稱\_  
> sprite 用圖檔：css selector-sprite_sprite 檔名 ex. btn-sprite_misc  
> 轉換成 jpg：檔名\_jpg
