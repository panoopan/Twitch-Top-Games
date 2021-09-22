//未重構版本
/* 
//初始畫面
//串 API: Top Game
const request = new XMLHttpRequest()
request.open('GET', 'https://api.twitch.tv/kraken/games/top?limit=5', true)
request.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json')
request.setRequestHeader('Client-ID', 'z0vtb0aw3epmvls35t9pn8xyl65kj9')
request.onerror = function() {
    console.log('error')
}
request.onload = function() {
    //拿 Top Game 資料
    if (request.status >=200 && request.status <400) {
        let games
        try {
            games = JSON.parse(request.response).top
        } catch(e) {
            console.log(e)
        }
        //TopGame 畫面
        for (let game of games) {
            const div = document.createElement('div')
            div.innerText = game.game.name
            document.querySelector('.nav__list').appendChild(div)
        }

        //標題
        document.querySelector('h1').innerText = games[0].game.name

        //串 API:stream list
        const request2 = new XMLHttpRequest()
        request2.open('GET', 'https://api.twitch.tv/kraken/streams/?limit=20&game=' + encodeURIComponent(games[0].game.name), true)
        request2.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json')
        request2.setRequestHeader('Client-ID', 'z0vtb0aw3epmvls35t9pn8xyl65kj9')
        request2.onerror = function() {
            console.log('error')
        }
        request2.onload = function() {
            //callback function
            //拿 stream list 資料
            if (request2.status >=200 && request2.status <400) {
                let data
                try {
                    data = JSON.parse(request2.response).streams
                } catch(e) {
                    console.log(e)
                }

                //初始畫面:stream
                for (let stream of data) {
                    const div = document.createElement('div')
                    div.classList.add('stream')
                    div.innerHTML = 
                    `
                    <div class="stream_top">
                        <img src="${stream.preview.medium}">
                    </div>
                    <div class="stream_bottom">
                        <div class="stream_avatar"><img src="${stream.channel.logo}" alt=""></div>
                        <div class="stream_info">
                            <div class="stream_info-title">${stream.channel.status}</div>
                            <div class="stream_info-name">${stream.channel.name}</div>
                        </div>
                    </div>
                    `
                    document.querySelector('.streams__block').appendChild(div)
                }
                //遊戲畫面排版處理
                const empty = document.createElement('div')
                empty.classList.add('stream')
                empty.classList.add('hide')
                document.querySelector('.streams__block').appendChild(empty)                
            } else {
                console.log(request2.status, request2.response)
            }
        }
        request2.send()
    } else {
        console.log(request2.status, request2.response)
    }
}
request.send()

//點擊後的畫面
//監聽點擊事件
document.querySelector('nav').addEventListener('click', function(e) {
    if(e.target.parentNode.classList.contains('nav__list')) {
        //遊戲畫面切換：改標題、清空遊戲畫面
        document.querySelector('h1').innerText = e.target.innerText
        document.querySelector('.streams__block').innerHTML = '' 
        
        //串 API:stream list
        const request2 = new XMLHttpRequest()
        request2.open('GET', 'https://api.twitch.tv/kraken/streams/?limit=20&game=' + encodeURIComponent(e.target.innerText), true)
        request2.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json')
        request2.setRequestHeader('Client-ID', 'z0vtb0aw3epmvls35t9pn8xyl65kj9')
        request2.onerror = function() {
            console.log('error')
        }
        request2.onload = function() {
            //拿 stream list 資料
            if (request2.status >=200 && request2.status <400) {
                let data
                try {
                    data = JSON.parse(request2.response).streams
                } catch(e) {
                    console.log(e)
                }

                //遊戲畫面
                for (let stream of data) {
                    const div = document.createElement('div')
                    div.classList.add('stream')
                    div.innerHTML = 
                    `
                    <div class="stream_top">
                        <img src="${stream.preview.medium}">
                    </div>
                    <div class="stream_bottom">
                        <div class="stream_avatar"><img src="${stream.channel.logo}" alt=""></div>
                        <div class="stream_info">
                            <div class="stream_info-title">${stream.channel.status}</div>
                            <div class="stream_info-name">${stream.channel.name}</div>
                        </div>
                    </div>
                    `
                    document.querySelector('.streams__block').appendChild(div)
                }

                //遊戲畫面排版處理
                const empty = document.createElement('div')
                empty.classList.add('stream')
                empty.classList.add('hide')
                document.querySelector('.streams__block').appendChild(empty)                
            } else {
                console.log(request2.status, request2.response)
            }
        }
        request2.send()
    } 
})
*/



// 重構版本
/*
流程：
1. 先照邏輯寫出程式碼，並確認功能正常
2. 重構程式碼
3. 把串 API 跟切版的步驟切割，並做成各種功能的 function
        getGames：串 API: Top Game & 拿資料
        getStream：串 API: stream list & 拿資料
        appendStream：遊戲畫面
        changeGame：遊戲畫面切換：改標題、清空遊戲畫面、載入新的遊戲畫面
4. 初始畫面-Top Game：getGames 拿到 top game 之後，把拿到的資料放到畫面上的 Top Game 列表
5. 初始畫面-stream：把前一步 top game 資料的第一個遊戲名稱帶入 changeGame，用 getStream 拿到遊戲資料後，再用 appendStream 把遊戲畫面放上去
6. 新增監聽事件事件：如果偵測到 Top Game 列表被點擊，就拿被點擊的遊戲名稱
7. 切換遊戲畫面：把上一步拿到的遊戲名稱帶入 changeGame，改標題、清空遊戲畫面之後，用 getStream 拿到遊戲資料，再用 appendStream 把新的遊戲畫面放上去
*/

const API_URL = "https://api.twitch.tv/kraken"
const ACCEPT = "application/vnd.twitchtv.v5+json"
const CLIENT_ID = "z0vtb0aw3epmvls35t9pn8xyl65kj9"
const STRAEM_TEMPLATE = 
`
<div class="stream_top">
    <a href="$url" target="_blank">
        <img src="$preview">
    </a>
</div>
<div class="stream_bottom">
    <div class="stream_avatar"><img src="$logo" alt=""></div>
    <div class="stream_info">
        <div class="stream_info-title">$status</div>
        <div class="stream_info-name">$name</div>
    </div>
</div>
`

getGame(function(games) {
    for (let game of games) {
        const div = document.createElement('div')
        div.innerText = game.game.name
        document.querySelector('.nav__list').appendChild(div)
    }
    changeGame(games[0].game.name)
})

document.querySelector('nav').addEventListener('click', function(e) {
    if(e.target.parentNode.classList.contains('nav__list')) {
        const gameName = e.target.innerText
        changeGame(gameName)
    }
})

function getGame(callback) {
    const request = new XMLHttpRequest()
    request.open('GET', `${API_URL}/games/top?limit=5`, true)
    request.setRequestHeader('Accept', ACCEPT)
    request.setRequestHeader('Client-ID', CLIENT_ID)
    request.onerror = function() {
        console.log('error')
    }
    request.onload = function() {
        if (request.status >=200 && request.status <400) {
            let games
            try {
                games = JSON.parse(request.response).top
            } catch(e) {
                console.log(e)
            }
            callback(games)
        } else {
            console.log(request.status, request.response)
        }
    }
    request.send()
}
function getStream(gameName, callback) {
    const request = new XMLHttpRequest()
    request.open('GET', `${API_URL}/streams/?limit=20&game=${encodeURIComponent(gameName)}`, true)
    request.setRequestHeader('Accept', ACCEPT)
    request.setRequestHeader('Client-ID', CLIENT_ID)
    request.onerror = function() {
        console.log('error')
    }
    request.onload = function() {
        if (request.status >=200 && request.status <400) {
            let streams
            try {
                streams = JSON.parse(request.response).streams
            } catch(e) {
                console.log(e)
            }
            callback(streams)
        } else {
            console.log(request.status, request.response)
        }
    }
    request.send()
}
function appendGame(stream) {
    const div = document.createElement('div')
    div.classList.add('stream')
    div.innerHTML = STRAEM_TEMPLATE
    .replace("$url", stream.channel.url)
    .replace("$preview", stream.preview.medium)
    .replace("$logo", stream.channel.logo)
    .replace("$status", stream.channel.status)
    .replace("$name", stream.channel.name)
    document.querySelector('.streams__block').appendChild(div)
}
function changeGame(gameName) {
    document.querySelector('h1').innerText = gameName
    document.querySelector('.streams__block').innerHTML = '' 
    getStream(gameName, function(streams) {
        for (let stream of streams) {
            appendGame(stream)
        }
        const empty = document.createElement('div')
        empty.classList.add('stream')
        empty.classList.add('hide')
        document.querySelector('.streams__block').appendChild(empty)
    })
}
