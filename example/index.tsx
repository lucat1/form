import * as React from "react";
import { render } from "react-dom";

import useForm from "..";

let rerender = 0;
const Example: React.FunctionComponent = () => {
  const { handle, register, errors } = useForm<{
    test: string;
    test1: string;
    test2: string;
  }>();

  // React.useEffect(() => {
  //   const int = setInterval(() => setCount(count + 1), 100);
  //   return () => clearInterval(int);
  // });

  const onSubmit = (data) => {
    console.log("submitted", data);
  };

  return (
    <div>
      render count: {rerender++}
      <br />
      `form` Example
      <form onSubmit={handle(onSubmit)}>
        <input
          name="test"
          type="text"
          placeholder="Required only form"
          ref={register({
            required: "This field is required",
          })}
        />
        {errors.test && <h2 style={{ color: "red" }}>{errors.test} test</h2>}

        <input
          name="test1"
          type="text"
          placeholder="Non required form"
          ref={register({
            required: false,
          })}
        />
        {errors.test1 && <h2 style={{ color: "red" }}>{errors.test1} test1</h2>}

        <input
          name="test2"
          type="text"
          placeholder="Regexp form"
          ref={register({
            match: /.ts/,
          })}
        />
        {errors.test2 && <h2 style={{ color: "red" }}>{errors.test2} test2</h2>}

        <button type="submit">submit</button>
      </form>
    </div>
  );
};

render(<Example />, document.getElementById("root"));
