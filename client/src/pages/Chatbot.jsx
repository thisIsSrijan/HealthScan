import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SendHorizontal, Mic, MicOff, Bot, User, Loader2 } from "lucide-react";

// Helper component to render structured JSON responses
const StructuredMessage = ({ content }) => {
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    // If parsing fails, just render the content as plain text
    return <div>{content}</div>;
  }
  return (
    <div className="space-y-4 structured-message">
      {data.overview && (
        <div>
          <h3 className="font-bold">Overview</h3>
          <p dangerouslySetInnerHTML={{ __html: data.overview }} />
        </div>
      )}
      {data.warnings && data.warnings.length > 0 && (
        <div>
          <h3 className="font-bold text-red-600">Warnings</h3>
          <ul className="pl-5 list-disc">
            {data.warnings.map((warning, index) => (
              <li key={index}>
                <strong dangerouslySetInnerHTML={{ __html: warning.drugCombination }} />:{" "}
                <span dangerouslySetInnerHTML={{ __html: warning.reason }} />.{" "}
                <span dangerouslySetInnerHTML={{ __html: warning.recommendation }} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.advice && (
        <div>
          <h3 className="font-bold">Advice</h3>
          <p dangerouslySetInnerHTML={{ __html: data.advice }} />
        </div>
      )}
      {data.references && (
        <div>
          <h3 className="font-bold">References</h3>
          <p dangerouslySetInnerHTML={{ __html: data.references }} />
        </div>
      )}
    </div>
  );
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm HealthScan, your virtual health assistant. How can I help you today? You can ask me about your symptoms, general health advice, or information about medical conditions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scrolling to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (userMessage) => {
    setIsLoading(true);

    // Add user's message to chat history
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, role: "user", content: userMessage },
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
          body: JSON.stringify({ message: userMessage }),
        }
      );

      const data = await response.json();

      // Here we assume that the backend sends a JSON string that follows our structure.
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: data.message,
          isStructured: true, // flag to denote structured JSON response
        },
      ]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content:
            "I'm having trouble responding right now. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    sendMessage(input);
    setInput("");
  };

  const toggleRecording = () => {
    // Web Speech API implementation tbd
    setIsRecording(!isRecording);

    if (!isRecording) {
      // Simulate recording and transcription
      setTimeout(() => {
        setInput("I've been having headaches for the past few days");
        setIsRecording(false);
      }, 2000);
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <div className="health-container flex flex-col h-full">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Health Assistant
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chat with your virtual doctor about symptoms and health concerns.<span className="text-amber-400 font-bold"> Note that our system can make mistakes sometime as it is still under development.</span>
        </p>
      </motion.div>
      <div className="flex flex-col flex-1 overflow-hidden card">
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={messageVariants}
                className={`flex mb-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start ${
                    message.isStructured ? "max-w-3xl" : "max-w-3/4"
                  } ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      message.role === "user" ? "ml-3" : "mr-3"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300"
                          : "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.isStructured
                        ? "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        : message.role === "user"
                        ? "bg-emerald-500 dark:bg-emerald-600 text-white rounded-bl-xl"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-br-xl"
                    }`}
                  >
                    {message.role === "assistant" && message.isStructured ? (
                      <StructuredMessage content={message.content} />
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className="flex justify-start mb-4"
              >
                <div className="flex items-start max-w-3/4">
                  <div className="flex-shrink-0 mr-3">
                    <div className="flex items-center justify-center w-8 h-8 text-teal-600 bg-teal-100 rounded-full dark:bg-teal-900 dark:text-teal-300">
                      <Bot size={16} />
                    </div>
                  </div>
                  <div className="flex items-center px-4 py-3 space-x-2 text-gray-800 bg-gray-100 rounded-lg rounded-tl-none dark:bg-gray-700 dark:text-gray-100">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Analyzing your health information...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-full ${
                isRecording
                  ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 animate-pulse"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health concern..."
              className="flex-1 py-2 input-field"
            />
            <motion.button
              type="submit"
              className="p-2 text-white rounded-full bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={input.trim() === ""}
            >
              <SendHorizontal size={20} />
            </motion.button>
          </form>

          <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
            <p>
              <span className="mr-1 text-yellow-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 pill-button">
                Note
              </span>
              This virtual assistant is for informational purposes only and does not replace
              professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
