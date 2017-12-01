// ==UserScript==
// @name        nicorepo-filter-114514
// @namespace   www.psychedesire.org
// @description ニコニコ動画のマイページのニコレポをフィルタするユーザースクリプトです。
// @noframes
// @match       http://www.nicovideo.jp/my
// @match       http://www.nicovideo.jp/my/top
// @match       http://www.nicovideo.jp/my/top/*
// @version     1.0.0
// @downloadURL https://github.com/psychedesire/nicorepo-filter-114514/raw/master/nicorepo-filter-114514.user.js
// @updateURL   https://github.com/psychedesire/nicorepo-filter-114514/raw/master/nicorepo-filter-114514.user.js
// ==/UserScript==

/*
覚書
<div class="NicorepoTimelineItem">←２・ここにクラスを追加
  <div class="log-content">
    <div class="log-body">
      <span>タイトル</span>←１・ここのタイトルを見て
    </div>
  </div>
</div>
*/

(function() {
    "use strict";
    const settings = [
        {
            str :"動画を投稿しました",
            name:"nf114514_post_movie",
            ttl :"動投稿"
        },
        {
            str :"動画が追加されました",
            name:"nf114514_ch_append_movie",
            ttl :"ch動画"
        },
        {
            str :"動画を追加しました",
            name:"nf114514_com_append_movie",
            ttl :"コ動画"
        },
        {
            str :"動画を登録しました",
            name:"nf114514_clip_movie",
            ttl :"動クリ"
        },
        {
            str :"イラストを投稿しました",
            name:"nf114514_post_image",
            ttl :"イ投稿"
        },
        {
            str :"イラストをクリップしました",
            name:"nf114514_clip_image",
            ttl :"イクリ"
        },
        {
            str :"生放送が予約されました",
            name:"nf114514_reserve_live",
            ttl :"生予約"
        },
        {
            str :"生放送を開始しました",
            name:"nf114514_start_live",
            ttl :"生開始"
        },
        {
            str :"ニコニ広告で宣伝しました",
            name:"nf114514_ad",
            ttl :"宣伝乙"
        },
        {
            str :"再生を達成しました",
            name:"nf114514_counter",
            ttl :"数達成"
        },
        {
            str :"位を達成しました",
            name:"nf114514_ranking",
            ttl :"位達成"
        },
        {
            str :"※その他の場合はこのタグをつける※",
            name:"nf114514_other",
            ttl :"その他"
        }
    ];
    // このスクリプトによって処理済みの全ての要素に付与される css class 名
    const done_class_name = "nf114514_done";

    // done_class_name を持つ要素の数
    let done_count = 0;

    // タイトルの親要素のクラス名
    const title_outer_class_name = ".log-body";

    // タイトルのタグ名
    const title_tag_name = "span";

    // タイトルの親要素の親要素の親要素のクラス名
    const parent_class_name = ".NicorepoTimelineItem";

    // フィルター中の class 名(無しの場合空文字)
    let current_filtered_class = "";

    // タイトルの親要素の親要素の親要素の css display の default
    const parent_css_display = "block";

    // サイトヘッダーのid
    const site_header_id = "siteHeader";

    // このスクリプトで生成される div ヘッダの html id
    const custom_header_id = "nf114514_header";

    // logging
    const logging = (_str) => {
        console.log("NicorepoFilter114514::" + _str);
    };

    // タイトルの親要素の親要素につけるタグ名を取得
    const get_grand_class_name = (_obj) => {
        const s = _obj.innerText;
        const l = settings.length - 1;
        // settings の最後のやつやらないのでfor文で
        for(let i = 0; i < l; i ++){
            if(s.match(new RegExp(settings[i]["str"], "g"))){ return settings[i]["name"]; }
        }
        return settings[l]["name"];
    };

    // CSS Class 付与関連処理
    const fix_class = () => {
        const elms = document.querySelectorAll(title_outer_class_name);
        if(!elms.length){ logging("NoElementsError::" + title_outer_class_name); return; }
        elms.forEach((_elm, _i, _self) => {
            let p = _elm.parentNode.parentNode.classList;
            if(!p.contains(done_class_name)){
                let obj = _elm.getElementsByTagName(title_tag_name);
                if(!obj.length){ return; }
                let c = get_grand_class_name(obj[0]);
                p.add(c);
                p.add(done_class_name);
                // 最新のフィルター中クラスに該当しない場合は表示しない
                _elm.parentNode.parentNode.style.display = (c !== current_filtered_class && current_filtered_class !== "") ? "none" : parent_css_display;
                done_count ++;
            }
        });
    };

    // li 要素クリック時の背景色変更
    const change_li_bg_color = (_li) => {
        const h = document.getElementById(custom_header_id);
        const u = h.querySelectorAll("ul")[0];
        const l = u.querySelectorAll("li");
        l.forEach((_obj, _i, _self) => {
            _obj.style.backgroundColor = "transparent";
        });
        _li.style.backgroundColor = "#444444";
    };

    // 全表示用の li 要素の追加
    const set_first_list_item = (_ul) => {
        let li = document.createElement("li");
        li.innerText = "全表示";
        li.setAttribute("style",
                        "color:white; cursor:pointer; display:inline-block; float:left; padding:5px 15px");
        li.addEventListener("click", () => {
            // 最新のフィルター中クラスを空にする
            current_filtered_class = "";
            // 背景色変更
            change_li_bg_color(li);
            //
            const elms = document.querySelectorAll(parent_class_name);
            if(!elms.length){ return; }
            // クリック時に全ての要素を表示
            elms.forEach((_elm, _i, _self) => {
                    _elm.style.display = parent_css_display;
            });
        });
        _ul.appendChild(li);
    };

    // それ以外の li 要素の追加
    const set_list_items = (_ul) => {
        settings.forEach((_setting, _i, _self) => {
            let li = document.createElement("li");
            li.innerText = _setting.ttl;
            li.setAttribute("style",
                            "color:white; cursor:pointer; display:inline-block; float:left; padding:5px 15px");
            li.addEventListener("click", () => {
                // 最新のフィルター中クラスを書き換える
                current_filtered_class = _setting.name;
                // 背景色変更
                change_li_bg_color(li);
                //
                const elms = document.querySelectorAll(parent_class_name);
                if(!elms.length){ return; }
                elms.forEach((_elm, _i, _self) => {
                    // クリック時に該当するクラスの要素のみ表示
                    _elm.style.display = (!_elm.classList.contains(_setting.name)) ? "none" : parent_css_display;
                });
            });
            _ul.appendChild(li);
        });
    };

    // サイトヘッダーレ〇プ！メニューを足す先輩！
    const fix_header = () => {
        // ヘッダーの特定
        const header = document.getElementById(site_header_id);
        if(!header){ logging("NoHeaderElement::" + site_header_id); return; }
        // このスクリプトで使うメニューを作成
        const outer  = document.createElement("div");
        outer.id = custom_header_id;
        outer.setAttribute("style",
                           "display:inline-block;padding:5px; text-align:center; width:100%;");
        // このスクリプトで使うメニューに ul 要素を作成
        const ul     = document.createElement("ul");
        ul.setAttribute("style",
                       "display:inline-block");
        // 全表示用の li 要素を作成・ul 要素に追加
        set_first_list_item(ul);
        // それ以外の li 要素を作成・ul 要素に追加
        set_list_items(ul);
        // メニューに ul を追加
        outer.appendChild(ul);
        // ヘッダーにメニューを追加
        header.appendChild(outer);
        // div#header 要素の margin-top の fix
        const fix_h = document.getElementById("header");
        if(!fix_h){ return; }
        fix_h.style.marginTop = "40px";
    };

    // ニコレポをさらに読み込む(.NicorepoPastFetcher)のクリックを監視し、
    // 1500 ミリ秒以内にまだこのスクリプトで fix_class() の処理されていない要素が見つかれば、
    // fix_class() を実行する。
    // 次のニコレポの読み込みが react の VirtualDOM で処理がされている為、
    // こっちではこういうやり方をする他ない…かな？
    const wait_fetch = (_try) => {
        // 10回見つからなったら処理開始
        if(_try == 10){ return; }
        const c = document.querySelectorAll(parent_class_name);
        if(!c.length){ return; }
        if(c.length > done_count){
            fix_class();
            return;
        }
        const t = setTimeout(() => {
            wait_fetch(_try + 1);
        }, 150);
    };

    // ニコレポ描画処理を react でやってるので、window.onload でやらないと色々つっかえる。ホンマつっかえ。
    window.onload = () => {
        // ニコレポをさらに読み込むのクリックを監視
        const e = document.querySelectorAll(".NicorepoPastFetcher");
        e[0].addEventListener("click", () => { wait_fetch(0); });
        // 初期読み込み処理
        fix_class();
        fix_header();
    };
})();