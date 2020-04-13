// 在大佬的基础上新增一二三等奖

const UID = '5ad01d036fb9a028d444fc82'; //抽奖发起者UID
const TOPIC = '5e83f5d1f265da57fc4ace90'; //沸点ID

const FIRST_PRICE = 10; //抽取一等奖个数
const SECOND_PRICE = 20; //抽取二等奖个数
const THIRD_PRICE = 0; //抽取三等奖个数

let FIRST_PRICE_LUCKY_USER = []; //一等奖获得者
let SECOND_PRICE_LUCKY_USER = []; //二等奖获得者
let THIRD_PRICE_LUCKY_USER = []; //三等奖获得者

const HOT_TOPIC_COMMENT_URL = `https://hot-topic-comment-wrapper-ms.juejin.im/v1/comments/${TOPIC}`;
const FOLLOWER_URL = 'https://follow-api-ms.juejin.im/v1/getUserFollowerList';

/**
 * Fisher–Yates shuffle
 */
Array.prototype.shuffle = function() {
    const self = this;
    const l = self.length - 1;
    for (let i = l; i >= 0; i--) {

        const randomIndex = Math.floor(Math.random() * (i + 1));
        const itemAtIndex = self[randomIndex];

        self[randomIndex] = self[i];
        self[i] = itemAtIndex;
    }
    return self;
};

/**
 * A包含B，求补集
 * father Array [1,2,3,4,5,6]
 * son Array [1,2,3]
 * 输出 [4,5,6]
 */
function removeArrCopy(son, father) {
    son.forEach(item => {
        let i = father.findIndex(a => a == item)
        if (i > -1) {
            father.splice(i, 1)
        }
    })
    return father
}

async function getAllComments(pageNum = 1) {
    const {
        d: {
            comments
        }
    } = await fetch(`${HOT_TOPIC_COMMENT_URL}?pageNum=${pageNum}&pageSize=20`, {
        headers: {
            'x-juejin-client': '',
            'x-juejin-token': '',
            'x-juejin-src': 'web',
        },
    }).then(res => res.json());

    if (comments.length === 0) return [];

    const others = await getAllComments(pageNum + 1);
    return [...comments, ...others];
}


async function getAllFollowers(before = '') {
    const {
        d: followers
    } = await fetch(`${FOLLOWER_URL}?uid=${UID}&currentUid=${UID}&before=${before}&src=web`).then(res => res.json());
    if (followers.length === 0) return [];
    const others = await getAllFollowers(followers.reverse()[0].createdAtString);
    return [...followers, ...others];
}


(async () => {
    const t = new Date();
    console.log(`当前时间：${t.toLocaleDateString()} ${t.toLocaleTimeString()}`);

    console.log('正在获取沸点评论……');
    const comments = await getAllComments();
    const commentUsers = comments.map(comment => comment.userInfo.username);

    console.log('正在获取关注者……');
    const followers = await getAllFollowers();
    const followerUsers = followers.map(follow => follow.follower.username);

    let validUsers = Array.from(new Set(commentUsers)).filter(user => followerUsers.includes(user));
    console.log('有效参与抽奖用户:', validUsers);

    if (FIRST_PRICE) {
        FIRST_PRICE_LUCKY_USER = validUsers.shuffle().slice(0, FIRST_PRICE);
        console.log('一等奖中奖用户:', FIRST_PRICE_LUCKY_USER);
    }

    if (SECOND_PRICE) {
        SECOND_PRICE_LUCKY_USER = removeArrCopy(FIRST_PRICE_LUCKY_USER, validUsers).shuffle().slice(0, SECOND_PRICE);
        console.log('二等奖中奖用户:', SECOND_PRICE_LUCKY_USER);
    }

    if (THIRD_PRICE) {
        THIRD_PRICE_LUCKY_USER = removeArrCopy(SECOND_PRICE_LUCKY_USER, validUsers).shuffle().slice(0, THIRD_PRICE);
        console.log('三等奖中奖用户:', THIRD_PRICE_LUCKY_USER);
    }
})();
