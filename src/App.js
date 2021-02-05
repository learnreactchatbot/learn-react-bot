import React, { Component } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';


import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userMessage: '',
	  conversation: [],
        userId : new Date().getTime(),
        toEmailModalOpen : false
    };
  }



  componentDidMount() {
    this.startListenerWebSocketClient();
    this.startPublisherWebSocketClient();
  }

  startListenerWebSocketClient() {
    this.listenSocket = new WebSocket("wss://learn-react-bot-node-flow.herokuapp.com/publish");
    this.listenSocket.onopen = () => {
      console.log('connected');
    }
    function convertToMessage(str) {
          let convertedMessage='';
          if(typeof str == 'string') {
              convertedMessage=str;
          } else {
              try {
                  let tempstr=JSON.stringify(str);
                  JSON.parse(tempstr);
                  convertedMessage=tempstr;
              } catch (e) {
                  convertedMessage=str;
              }
          }
          return convertedMessage;
      }
    this.listenSocket.onmessage = event => {
        let response=JSON.parse(event.data.trim());
        if(response.userId === this.state.userId) {
            let message=response.data;
            const msg = {
                text: convertToMessage(message),
                user: 'ai'
            };
            this.setState({
                conversation: [...this.state.conversation, msg],
            });
        }
      }
      this.listenSocket.onclose = () => {
          console.log('disconnected');
          this.listenSocket=null;
          // automatically try to reconnect on connection loss
          this.startListenerWebSocketClient();
      }
  }

  startPublisherWebSocketClient() {
    this.publishSocket = new WebSocket("wss://learn-react-bot-node-flow.herokuapp.com/receive");

    this.publishSocket.onopen = () => {
      console.log('connected');
    }

    this.publishSocket.onmessage = evt => {
      console.log(evt.data);
    }

    this.publishSocket.onclose = () => {
      console.log('disconnected');
      this.publishSocket=null;
      // automatically try to reconnect on connection loss
      this.startPublisherWebSocketClient();
    }

  }
  submitMessage = messageString => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
      const message = { channelType: 'chatbot', message: messageString, userId: this.state.userId }
      this.publishSocket.send(JSON.stringify(message));
  }
  handleChange = event => {
    this.setState({ userMessage: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    if (!this.state.userMessage.trim()) return;

    const msg = {
      text: this.state.userMessage,
      user: 'human',
    };

    this.setState({
      conversation: [...this.state.conversation, msg],
    });

    this.submitMessage({
      message: this.state.userMessage
    });

    this.setState({ userMessage: '' });
  };


  sendEmail(conversation, publisher, toEmail) {
      const message = { channelType: 'email', message: conversation, subject: 'Chat History', to:toEmail };
      this.setState({toEmailModalOpen: false});
    publisher.send(JSON.stringify(message));
  }
  render() {
      const handleEmailModalClick = (toEmailModalOpen) => {
          this.setState({toEmailModalOpen: toEmailModalOpen, toEmailAddress : ''});
      }
      const handleToEmailAddressChange = event => {
          this.setState({ toEmailAddress: event.target.value });
      };
      const responseFacebook = (response) => {
          console.log(response);
      }

      const responseGoogle = (response) => {
          console.log(response);
      }
    const ChatBubble = (event, i, className) => {
      return (
          <div>
            <div key={`${className}-${i}`} className={`${className} chat-bubble`}>
              <span className="chat-content">{event.text}</span>
            </div>
          </div>

      );
    };

    const chat = this.state.conversation.map((e, index) =>
      ChatBubble(e, index, e.user)
    );
      const closeIcon=require('./error.png');
      const mailIdIcon=require('./icons8-send-mail-100 (1).png')
    const mailIcon=require('./icons8-send-mail-100.png');
    return (
        <div>
          <div className="chat-window">
            <div className="chat-heading">
              <h1 className="animate-chat">React Chatbot</h1>
              {/*   */}
              <div className="interior">

                  <div>
                      <img className="mailId-box" src={mailIdIcon} title="Enter Your Mail" onClick={() => handleEmailModalClick(true)} />
                  </div>
               </div>
                {this.state.toEmailModalOpen ? (
                    <div id="open-modal" className="modal-window" >
                        <div className="modal-window-div">
                            <a href="#" title="Close" className="modal-close"><img className="close-icon" onClick={() => handleEmailModalClick(false)} src={closeIcon}/></a>
                            <form className="form">
                                <input type="text" className="form__field" placeholder="Your E-Mail Address" value={this.state.toEmailAddress}
                                       onInput={handleToEmailAddressChange}
                                />


                                <button type="button" onClick={() => this.sendEmail(this.state.conversation, this.publishSocket, this.state.toEmailAddress)} className="btn btn--primary btn--inside uppercase">Send</button>
                                <button type="button" onClick={() => handleEmailModalClick(false)} className="btn btn--danger btn--inside uppercase">Close</button>
                            </form>
                        </div>
                    </div>
                ) : (
                    ''
                )}
              </div>
            <ScrollToBottom className="conversation-view ">
              <div  id={'chathistory'}>{chat}</div>
              <div className="ticontainer">
                <div className="tiblock">
                  <div className="tidot"></div>
                  <div className="tidot"></div>
                  <div className="tidot"></div>
                </div>
              </div>
			  </ScrollToBottom>
              <form onSubmit={this.handleSubmit}>
              <input
                  value={this.state.userMessage}
                  onInput={this.handleChange}
                  className="css-input"
                  type="text"
                  autoFocus
                  placeholder="Type your message and hit Enter to send"    />
            </form>
        </div>
		</div>
    );
  }
}
export default App;
