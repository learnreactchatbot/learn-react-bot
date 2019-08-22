import React, { Component } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';


import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userMessage: '',
	  conversation: []
    };
  }

  componentDidMount() {
    this.startListenerWebSocketClient();
    this.startPublisherWebSocketClient();
  }

  startListenerWebSocketClient() {
    this.listenSocket = new WebSocket("ws://localhost:1880/public/messagepublish");
    this.listenSocket.onopen = () => {
      console.log('connected')
    }
    this.listenSocket.onmessage = event => {
      const msg = {
        text: event.data.trim(),
        user: 'ai'
      };
      this.setState({
        conversation: [...this.state.conversation, msg]
      });
      this.listenSocket.onclose = () => {
        console.log('disconnected');
        this.listenSocket=null;
        // automatically try to reconnect on connection loss
         this.startListenerWebSocketClient();
      }
    }

  }
  startPublisherWebSocketClient() {
    this.publishSocket = new WebSocket("ws://localhost:1880/public/messagereceive");

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
    const message = { channelType: 'chatbot', message: messageString }
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


  sendEmail(conversation, publisher) {
    const message = { channelType: 'email', message: conversation, subject: 'Chat History', to:'lionelpannaisamy@gmail.com;tamilselvam.r@gmail.com;rk@softonics.in' };
    console.log(JSON.stringify(message));
    publisher.send(JSON.stringify(message));
  }
  render() {
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
    const mailIcon=require('./icons8-send-mail-100.png');
    return (
        <div>
          <div className="chat-window">
            <div className="chat-heading">
              <h1 className="animate-chat">React Chatbot</h1>
              {/*   */}
              <div className="interior">

                <img className="mail-box" alt='' onClick={() => this.sendEmail(this.state.conversation, this.publishSocket)} src={mailIcon} title="Send Conversation"/>
               </div>
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
