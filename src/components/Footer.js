import React from 'react';

import 'bulma/css/bulma.css';
import '../css/footer.css';

export default function Footer(props){
  return (
    <div>
      <footer className="footer">
        <div className="container">
          <div className="content has-text-centered">
            <p>
              <strong>Highlander</strong> by <a className="heribertoFooterName" href="https://iamromanh.github.io/heribertoResumeSite/index.html#">
              Heriberto Roman</a> made with <i className="fa fa-heart fa-2x heribertoHeart"></i>.
            </p>
            <p>
              <a className="icon" href="https://github.com/iamromanh">
                <i className="fa fa-github heribertoGithubIcon"></i>
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
