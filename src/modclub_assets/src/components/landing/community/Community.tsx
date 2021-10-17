import "./Community.scss";
import twitterImg from '../../../../assets/twitter.png';
import discordImg from '../../../../assets/discord.jpeg';
import dscvrImg from '../../../../assets/dscvr.jpeg';
import mediumImg from '../../../../assets/medium.png';

import Card from "../../common/Card";
export default function Community() {
  return (
    <div className="column" style={{height: '100%',justifyContent:'space-evenly'}}>
      <div className="row" style={{justifyContent:'space-evenly', marginBottom: 5}}>
  
        <div className="CommunityCard" >
          <a href="https://twitter.com/ModclubApp">
              <img className="CommunityImg" src={twitterImg}/>
          </a>
          <p className="CommunityTitle">Twitter</p>
        </div>
        
        
        <div className="CommunityCard">
          <a href="http://discord.gg/8zUrHd46Tf">
              <img className="CommunityImg" src={discordImg}/>
          </a>
          <p className="CommunityTitle">Discord</p>
        </div>
        
      </div>
      <div className="row" style={{justifyContent:'space-evenly'}}>
      
        <div className="CommunityCard">
          <a href="https://dscvr.one">
              <img className="CommunityImg" src={dscvrImg}/>
          </a>
          <p className="CommunityTitle">DSCVR</p>
        </div>
      
        <div className="CommunityCard">
          <a href="https://medium.com/@modclub">
              <img className="CommunityImg" src={mediumImg}/>
          </a>
          <p className="CommunityTitle">Medium</p>
        </div>      
      </div>
    </div>
  );
}