import { Dimmer, Segment } from "semantic-ui-react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Loader = () => (
  <div className="flex justify-center items-center h-screen z-50">
    <Segment>
      <Dimmer active inverted style={{ background: "transparent" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="3x" color="#2185d0" />
      </Dimmer>
    </Segment>
  </div>
);

export default Loader;
