import React from 'react';

const Layout = (props) => {
  return (
    <div class="content-wrapper">
      <div class="center-align">
        {props.children}
      </div>
    </div>
  );
};

export default Layout;