import * as React from 'react'
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getContent } from "../../../utils/api";
import { Columns, Card, Level, Heading, Icon, Button } from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import Platform from "../platform/Platform";
import ApproveReject from "../modals/ApproveReject";
import { fileToImgSrc, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";

const InfoItem = ({ icon, title, info }) => {
  return (
    <Level>
      <Heading size={6} className="has-text-silver is-flex is-align-items-center mb-0" style={{ minWidth: 120 }}>
        <Icon className="mr-2">
          <span className="material-icons">{icon}</span>
        </Icon>
        <span>{title}</span>
      </Heading>
      <p className="has-text-silver">
        {info}
      </p>
    </Level>
  );
};

export default function Task() {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [voted, setVoted] = useState<boolean>(true);
  const [html, setHtml] = useState(null);

  const getImage = (data: any) => {
    const image = unwrap<Image__1>(data);
    return fileToImgSrc(image.data, image.imageType);
  }

  const fetchTask = async () => {
    const content = await getContent(taskId);
    console.log("content !!!!!!!!!!!!!!!!!!!!!!!", content);
    setTask(content);
    setHtml(`<div class="container">
    <br>
    <br>
    <div>
    <input hidden="" type="text" value="96" id="postId">
    <div>
        <div class="mr-2 nuanceLogo-2" width="30" height="30"><div id="profile" title="Not logged on" class="dropdown mr-3" style="float:left"><img src="ba097b490b92a293f48d.png" width="44" height="50"></div></div>matador
        <button style="background-color: black; color: aquamarine; float:right;" type="button" id="sharePost" class="btn rightPanelButton">Share</button>
        </div>
        <br><br>
        <h3><p>ボリンジャーマップ</p></h3>
        <br>
        <p></p><p><span style="background-color: rgb(247, 249, 249); color: rgb(34, 34, 34);">Steemitからnoteに移植したものを、再移植。</span></p><p><br></p><p><span style="background-color: rgb(247, 249, 249); color: rgb(34, 34, 34);">　　＊＊＊＊＊＊＊＊＊＊＊＊＊</span></p><p><br></p><p>ここ↓で書いているボリンジャーマップの説明をBTC用に書き直します。</p><p><a href="http://blog.goo.ne.jp/fxtradenote/e/125305a9df867131bc9d699bc284e08f?" rel="noopener noreferrer" target="_blank" style="color: inherit;">http://blog.goo.ne.jp/fxtradenote/e/125305a9df867131bc9d699bc284e08f</a></p><p><strong>「ボリンジャーマップ」</strong>は、私の造語です。</p><p>複数の時間足の「期間２０のボリンジャーバンド」を一枚のチャートに重ねて表示したもの。</p><p><strong>利点その１．</strong></p><p>長い時間足のボリンジャーバンドが拡大表示されるので、細かい動きが分かる。</p><p>（拡大されていても非常に正確に反応していることが多い。）</p><p><strong>利点その２．</strong></p><p>複数の時間足のボリンジャーバンドの重なりが一目で分かる。</p><p>重なっている所はそれだけ強くなる。</p><p>ブレイクして急騰・急落した時、長い時間足のボリンジャーバンドで止められて急反転することも多い。</p><p><strong>利点その３．</strong></p><p>プライスの動きに従って、複数時間足のボリンジャーバンドのチャートポイントを連続的に確認出来る。</p><p><strong>利点その４．</strong></p><p>これによって、後で説明する「ジェイウォーク」の動きと、そのトリガーが、一見して明らかになる。</p><p>こんなチャート　↓。</p><p>BTCUSD</p><p><strong>４時間足ボリンジャーマップ</strong></p><p><span style="color: inherit;"><img src="https://assets.st-note.com/production/uploads/images/39574992/picture_pc_988ef48a64788dc7d04beb18daff291e.png?width=800" alt="画像3" height="270" width="620"></span></p><p>基本のチャートは、４時間足。</p><p>水色；期間２０のボリンジャーバンド</p><p> 太実線は、センターライン</p><p> 細実線は、±２σ</p><p>紫色；期間１２０のボリンジャーバンド</p><p>（日足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>緑色；期間８４０のボリンジャーバンド</p><p>（週足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>茶色；期間３６００のボリンジャーバンド</p><p>（月足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p><br></p><p><strong>１５分足ボリンジャーマップ</strong></p><p><span style="color: inherit;"><img src="https://assets.st-note.com/production/uploads/images/39575066/picture_pc_ac48b9e271943582f65048da537a07d4.png?width=800" alt="画像3" height="270" width="620"></span></p><p>基本のチャートは、１５分足。</p><p>赤色；期間２０のボリンジャーバンド（線種については同上）</p><p>黄色；期間８０のボリンジャーバンド</p><p>（１時間足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>水色；期間３２０のボリンジャーバンド</p><p>（４時間足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>紫色；期間１９２０のボリンジャーバンド</p><p>（日足における期間２０のボリンジャーバンドに相当）（線種についてはは同上）</p><p><br></p><p><strong>１分足ボリンジャーマップ</strong></p><p><span style="color: inherit;"><img src="https://assets.st-note.com/production/uploads/images/39575125/picture_pc_1502eb63df8595f7a109a5c06bf137ab.png?width=800" alt="画像3" height="270" width="620"></span></p><p>基本のチャートは、１分足。</p><p>赤色；期間２０のボリンジャーバンド（線種については同上）</p><p>黄色；期間１００のボリンジャーバンド</p><p>（５分足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>水色；期間３００のボリンジャーバンド</p><p>（１５分足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>紫色；期間１２００のボリンジャーバンド</p><p>（１時間足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p>黒色；期間４８００のボリンジャーバンド</p><p>（４時間足における期間２０のボリンジャーバンドに相当）（線種については同上）</p><p></p>
        <br>
        <p style="display: inline-block;"><i class="fas fa-tags"></i>
           <span class="badge badge-light"></span>
           <span id="createdDateDisplay"><i class="fas fa-calendar-alt mr-1"></i><small>created: 11/6/2021, 10:39:21 PM</small></span>
           <span id="modifiedDateDisplay"><i class="fas fa-calendar-alt mr-1 ml-2"></i><small>modified: 11/6/2021, 10:39:21 PM</small></span>
        </p>
     </div>
    <br>
  </div>`);
  }

  useEffect(() => {
    fetchTask();
    setVoted(false);
  }, [voted]);

  return (
    <>
      <Userstats />

      {!task ? (
        <div className="loader is-loading p-4 mt-6" />
      ) : (
        <Columns>
          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 8 }}>
            <Card>
              <Card.Header>
                <Card.Header.Title>
                  {task.providerName}
                  <span>
                    Submitted by {task.sourceId}
                  </span>
                </Card.Header.Title>
                <Progress
                  value={Number(task.voteCount)}
                  min={Number(task.minVotes)}
                />
              </Card.Header>
              <Card.Content>
                <Heading>
                  {task.title}
                </Heading>

                {/* {'imageBlob' in task.contentType ?
                  <img src={getImage(task.image)} alt="Image File" style={{ display: "block", margin: "auto" }} />
                  :
                  <p>{task.text}</p>
                } */}

                <div dangerouslySetInnerHTML={{__html: html }} />

                <Card backgroundColor="dark" className="mt-5">
                  <Card.Content>
                    <Heading subtitle>
                      Additional Information
                    </Heading>

                    <InfoItem
                      icon="assignment_ind"
                      title="Link to Post"
                      info="http://www.example.com/post1"
                    />
                    <InfoItem
                      icon="assignment_ind"
                      title="Category"
                      info="Gaming"
                    />
                    <InfoItem
                      icon="assignment_ind"
                      title="Comment"
                      info="This post looked suspicious please review as we are not sure"
                    />
                  </Card.Content>
                </Card>
              </Card.Content>
              <Card.Footer className="pt-0" style={{ border: 0 }}>
                <Button.Group>
                  <ApproveReject
                    task={task}
                    fullWidth={true}
                    onUpdate={() => setVoted(true)}
                  />
                </Button.Group>
              </Card.Footer>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 4 }}>
            <Platform providerId={task.providerId} />
          </Columns.Column>
        </Columns>
      )}
    </>
  )
}