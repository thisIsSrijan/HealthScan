import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, MicOff, Bot, User, Loader2 } from "lucide-react"

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your virtual health assistant. How can I help you today? You can ask me about your symptoms, general health advice, or information about medical conditions.",
    },
  ])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  //dummy responses based on keywords
  const mockResponses = {
    headache:
      "Headaches can be caused by various factors including stress, dehydration, lack of sleep, or eye strain. I recommend staying hydrated, getting adequate rest, and considering over-the-counter pain relievers if needed. If your headache is severe or persistent, please consult with a healthcare professional.",
    fever:
      "A fever is often a sign that your body is fighting an infection. For adults, a temperature above 100.4°F (38°C) is considered a fever. Rest, stay hydrated, and take acetaminophen or ibuprofen to help reduce the fever. If your fever is high (above 103°F/39.5°C) or lasts more than three days, please seek medical attention.",
    cold: "Common cold symptoms include runny nose, sore throat, cough, and mild fever. Rest, drink plenty of fluids, and use over-the-counter cold medications to relieve symptoms. Most colds resolve within 7-10 days. If symptoms worsen or persist longer, consult with a healthcare provider.",
    diet: "A balanced diet includes a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Try to limit processed foods, sugars, and excessive sodium. Based on your profile, focusing on foods rich in fiber and maintaining proper hydration would be beneficial for your overall health.",
    exercise:
      "Regular physical activity is crucial for maintaining health. Aim for at least 150 minutes of moderate exercise per week. Given your profile, activities like brisk walking, swimming, or cycling would be appropriate. Remember to start slowly and gradually increase intensity if you're new to exercise.",
  }

  //scrolling to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  //dummy function to process user input and generate a response
  const processMessage = (userMessage) => {
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      let response = "I'm not sure how to respond to that. Could you provide more details about your health concern?"

      Object.entries(mockResponses).forEach(([keyword, reply]) => {
        if (userMessage.toLowerCase().includes(keyword)) {
          response = reply
        }
      })

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 2,
          role: "assistant",
          content: response,
        },
      ])

      setIsLoading(false)
    }, 1500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (input.trim() === "") return

    const newMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, newMessage])
    processMessage(input)
    setInput("")
  }

  const toggleRecording = () => {
    //Web Speech API implementation tbd
    setIsRecording(!isRecording)

    if (!isRecording) {
      // Simulate recording and transcription
      setTimeout(() => {
        setInput("I've been having headaches for the past few days")
        setIsRecording(false)
      }, 2000)
    }
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  return (
    <div className="health-container flex flex-col h-[calc(100vh-4rem)]">
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Health Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chat with your virtual doctor about symptoms and health concerns
        </p>
      </motion.div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={messageVariants}
                className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start max-w-3/4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`flex-shrink-0 ${message.role === "user" ? "ml-3" : "mr-3"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === "user"
                          ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300"
                          : "bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300"
                      }`}
                    >
                      {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                    </div>
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-emerald-500 dark:bg-emerald-600 text-white rounded-tr-none"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={messageVariants}
                className="flex mb-4 justify-start"
              >
                <div className="flex items-start max-w-3/4">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 rounded-full flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none">
                    <Loader2 className="animate-spin" size={16} />
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
              className="flex-1 input-field py-2"
            />
            <motion.button
              type="submit"
              className="p-2 bg-emerald-500 dark:bg-emerald-600 text-white rounded-full hover:bg-emerald-600 dark:hover:bg-emerald-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={input.trim() === ""}
            >
              <Send size={20} />
            </motion.button>
          </form>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 pill-button mr-1">
                Note
              </span>
              This virtual assistant is for informational purposes only and does not replace professional medical
              advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot

