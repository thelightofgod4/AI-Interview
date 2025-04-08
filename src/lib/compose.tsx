/* eslint-disable react/display-name */
import React from "react";

const compose = (providers: any[]) =>
  providers.reduce((Prev, Curr) => ({ children }: any) => (
    <Prev>
      <Curr>{children}</Curr>
    </Prev>
  ));
export default compose;
