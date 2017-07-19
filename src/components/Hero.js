import React from 'react';

import 'bulma/css/bulma.css';
import '../css/hero.css';

export default function Hero(props) {
  return (
  <div>
    <section className="hero is-medium">
      <div className="hero-body bg-img">
        <div className="container container-hero">
          <h1 className="title title-hero has-text-centered">
            A Simple App For Coaches To Manage Their Teams, Smack Talk, and Poach Players from other teams.
          </h1>
        </div>

      <p className="hero-buttons">
        <a className="button is-info is-medium is-inverted is-outlined" href="login.html">Log In</a>
        <a className="button is-success is-medium is-inverted is-outlined" href="register.html">Sign Up</a>
      </p>
      </div>
    </section>

<section className="section afterHeroSection">
  <div className="container">
      <div className="columns level">
        <div className="column is-5">
          <div className="content">
            <h1>Manage Your Profile with Ease</h1>
            <p>As coach experience the simple way to manage teams, talk trash and poach players.</p>
          </div>
        </div>

        <div className="column is-3 is-offset-1">
          <div className="card">
            <div className="card-content">
              <p className="has-text-centered">
                <i className="fa fa-user-circle-o coach-card-icon" aria-hidden="true"></i>
              </p>
              <p className="title level-item">
                Coach
              </p>
              <p className="has-text-centered">
                <a className="button is-active is-1">
                  <span className="icon is-small">
                    <i className="fa fa-plus" aria-hidden="true"></i>
                  </span>
                  <span>Create Team</span>
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="column is-3">
          <div className="card">
            <div className="card-content">
              <p className="has-text-centered">
                <i className="fa fa-user-circle coach-card-icon" aria-hidden="true"></i>
              </p>
              <p className="title level-item">
                Player
              </p>
              <p className="has-text-centered">
                <a className="button is-active is-1">
                  <span className="icon is-small">
                    <i className="fa fa-handshake-o" aria-hidden="true"></i>
                  </span>
                  <span>Poach Player</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>

<section className="section bg-image-average-promo">
  <div className="container">
      <div className="columns level has-text-centered">
        <div className="column is-3 is-offset-1">
          <div className="card">
            <nav className="panel has-text-centered">
              <p className="panel-heading">
                Batting Average
              </p>
              <div className="panel-block panel-heading panel-heading-center">
                <span className='battingAverageInline'>
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                      <p className="averagePlayerName">Randy Brown</p>
                    <p>.428</p>
                </span>
              </div>
              <div className="panel-block panel-heading panel-heading-center">
                <span className='battingAverageInline'>
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                      <p className="averagePlayerName">Kris Big-Mac</p>
                    <p>.407</p>
                </span>
              </div>
              <div className="panel-block panel-heading panel-heading-center">
                <span className='battingAverageInline'>
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                      <p className="averagePlayerName">Eddie Roman</p>
                    <p>.389</p>
                </span>
              </div>
              <div className="panel-block panel-heading panel-heading-center">
                <span className='battingAverageInline'>
                    <i className="fa fa-user-circle-o" aria-hidden="true"></i>
                      <p className="averagePlayerName">Eddie Roman</p>
                    <p>.389</p>
                </span>
              </div>
            </nav>
          </div>
        </div>

        <div className="column is-5 is-offset-2">
          <div className="content" id="averageText">
            <h1 id="averageH1Text">Who is on top of thier game?</h1>
            <p>As a coach brag about your team and player standings with other head coaches.</p>
          </div>
        </div>
      </div>
    </div>
</section>
</div>
  )
}
