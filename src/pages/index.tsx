import React from "react";
import { GetServerSideProps } from "next";
import { Accordion, Card, Container, Image } from "react-bootstrap";
import { FaChevronLeft, FaPowerOff } from "react-icons/fa";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";

interface Props {
  radios: Radio[];
}

interface Radio {
  name: string;
  frequency: number;
  image: string;
}

const Home: React.ComponentType<Props> = ({ radios }): JSX.Element => {
  const [activeKey, setActiveKey] = React.useState<string>("");
  const [channelsCollapsed, setChannelsCollapsed] =
    React.useState<boolean>(false);

  const handleCollapse = (index: number) => {
    if (index.toString() === activeKey) {
      setActiveKey("");
    } else {
      setActiveKey(index.toString());
    }
  };

  const getCurrentStation = () => {
    if (activeKey === "") {
      return null;
    }
    return radios[parseInt(activeKey)].name;
  };

  const handleTurnOff = () => {
    setActiveKey("");
  };

  const removeLastItemBorder = (index: number) => {
    return index === radios.length - 1 ? "border-0" : "";
  };

  const switchStation = (type: string) => {
    let newActiveKey = activeKey;
    switch (type) {
      case "prev":
        const prev = Number(activeKey) - 1;
        newActiveKey = prev < 0 ? "0" : String(Number(activeKey) - 1);
        break;
      case "next":
        const next = Number(activeKey) + 1;
        newActiveKey =
          next > radios.length - 1
            ? String(radios.length - 1)
            : String(Number(activeKey) + 1);
        break;
    }
    setActiveKey(newActiveKey);
  };

  const handleChannelsCollapse = () => {
    setChannelsCollapsed(!channelsCollapsed);
  };

  return (
    <Container className="d-flex justify-content-center">
      <Card className="radio-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <FaChevronLeft
            className={`pointer transition-transform ${
              channelsCollapsed ? "rotate-90-deg" : ""
            }`}
            onClick={handleChannelsCollapse}
          />

          <span>STATIONS</span>
          <FaPowerOff className="pointer" onClick={handleTurnOff} />
        </Card.Header>
        <Card.Body
          className={`channels ${
            !channelsCollapsed ? "smooth-collapse" : "p-0"
          }`}
        >
          <Accordion
            className={channelsCollapsed ? "invisible" : "visible"}
            activeKey={activeKey}
            flush
          >
            {radios.map((radio: Radio, index: number) => (
              <Accordion.Item key={index} eventKey={index.toString()}>
                <Accordion.Header
                  className={removeLastItemBorder(index)}
                  onClick={() => handleCollapse(index)}
                >
                  <span className="channel-name">{radio.name}</span>
                  <span className="channel-frequency">{radio.frequency}</span>
                </Accordion.Header>
                <Accordion.Body className="d-flex flex-row justify-content-between align-items-center">
                  <FiMinusCircle
                    size="30"
                    className="pointer"
                    onClick={() => switchStation("prev")}
                  />
                  <div className="image-wrapper">
                    <Image
                      src={radio.image}
                      alt="fm image"
                      roundedCircle
                      className="image-fm"
                    />
                  </div>
                  <FiPlusCircle
                    size="30"
                    className="pointer"
                    onClick={() => switchStation("next")}
                  />
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card.Body>
        <Card.Footer className="d-flex flex-column align-items-center">
          {getCurrentStation() ? (
            <>
              <span className="current-text text-center">
                CURRENTLY PLAYING
              </span>
              <span className="current-channel text-center">
                {getCurrentStation()}
              </span>
            </>
          ) : (
            <span className="h-60px"></span>
          )}
        </Card.Footer>
      </Card>
    </Container>
  );
};

interface RadiosResponse {
  radios: Radio[];
  error: string | undefined;
}

interface ErrorResponse {
  error: string | undefined;
  radios: [];
}

export async function fetchRadios<T>(): Promise<T | ErrorResponse> {
  try {
    const response = await fetch(
      "https://jobapi.teclead-ventures.de/recruiting/radios"
    );
    if (!response.ok) {
      const error = await response.json();
      return { error: error.code, radios: [] };
    }
    return (await response.json()) as Promise<T>;
  } catch (err) {
    return { error: err as string, radios: [] };
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await fetchRadios<RadiosResponse>();

  return {
    props: {
      radios: !response.error ? response.radios : [],
    },
  };
};

export default Home;
