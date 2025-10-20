"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Drawer, DrawerActions, DrawerBody, DrawerHeader } from "motion-drawer";

const comments = [
  {
    id: 1,
    author: "Sarah Wilson",
    content: "Love the new updates! The animations are so smooth 🚀",
    avatar: "/path-to-avatar-1.jpg",
  },
  {
    id: 2,
    author: "Mike Johnson",
    content:
      "Great work on this! Looking forward to using it in my next project 👍",
    avatar: "/path-to-avatar-2.jpg",
  },
  {
    id: 3,
    author: "Emily Chen",
    content: "The integration with other libraries is seamless! Well done 🎉",
    avatar: "/path-to-avatar-3.jpg",
  },
  {
    id: 4,
    author: "David Rodriguez",
    content:
      "The documentation is super clear and helpful. Makes implementation a breeze 📚",
    avatar: "/path-to-avatar-4.jpg",
  },
  {
    id: 5,
    author: "Alex Thompson",
    content:
      "Been using this in production for a month now. Rock solid performance! 💪",
    avatar: "/path-to-avatar-5.jpg",
  },
  {
    id: 6,
    author: "Lisa Park",
    content: "The customization options are exactly what I needed. Thanks! ✨",
    avatar: "/path-to-avatar-6.jpg",
  },
  {
    id: 7,
    author: "Chris Martinez",
    content:
      "Responsive design works perfectly across all devices. Great job! 📱",
    avatar: "/path-to-avatar-7.jpg",
  },
  {
    id: 8,
    author: "Sophie Anderson",
    content: "The spring animations make the interactions feel so natural 🌟",
    avatar: "/path-to-avatar-8.jpg",
  },
  {
    id: 9,
    author: "James Lee",
    content:
      "Best drawer implementation I've used so far. Keep up the good work! 🏆",
    avatar: "/path-to-avatar-9.jpg",
  },
  {
    id: 10,
    author: "Nina Patel",
    content:
      "Love how lightweight it is while still maintaining all the features 🎯",
    avatar: "/path-to-avatar-10.jpg",
  },
  // {
  //   id: 1,
  //   author: "Sarah Wilson",
  //   content: "Love the new updates! The animations are so smooth 🚀",
  //   avatar: "/path-to-avatar-1.jpg",
  // },
  // {
  //   id: 2,
  //   author: "Mike Johnson",
  //   content:
  //     "Great work on this! Looking forward to using it in my next project 👍",
  //   avatar: "/path-to-avatar-2.jpg",
  // },
  // {
  //   id: 3,
  //   author: "Emily Chen",
  //   content: "The integration with other libraries is seamless! Well done 🎉",
  //   avatar: "/path-to-avatar-3.jpg",
  // },
  // {
  //   id: 4,
  //   author: "David Rodriguez",
  //   content:
  //     "The documentation is super clear and helpful. Makes implementation a breeze 📚",
  //   avatar: "/path-to-avatar-4.jpg",
  // },
  // {
  //   id: 5,
  //   author: "Alex Thompson",
  //   content:
  //     "Been using this in production for a month now. Rock solid performance! 💪",
  //   avatar: "/path-to-avatar-5.jpg",
  // },
  // {
  //   id: 6,
  //   author: "Lisa Park",
  //   content: "The customization options are exactly what I needed. Thanks! ✨",
  //   avatar: "/path-to-avatar-6.jpg",
  // },
  // {
  //   id: 7,
  //   author: "Chris Martinez",
  //   content:
  //     "Responsive design works perfectly across all devices. Great job! 📱",
  //   avatar: "/path-to-avatar-7.jpg",
  // },
  // {
  //   id: 8,
  //   author: "Sophie Anderson",
  //   content: "The spring animations make the interactions feel so natural 🌟",
  //   avatar: "/path-to-avatar-8.jpg",
  // },
  // {
  //   id: 9,
  //   author: "James Lee",
  //   content:
  //     "Best drawer implementation I've used so far. Keep up the good work! 🏆",
  //   avatar: "/path-to-avatar-9.jpg",
  // },
  // {
  //   id: 10,
  //   author: "Nina Patel",
  //   content:
  //     "Love how lightweight it is while still maintaining all the features 🎯",
  //   avatar: "/path-to-avatar-10.jpg",
  // },
];

export default function MyDrawer() {
  const [open, setOpen] = useState(false);

  const [count, setCount] = useState(2);

  return (
    <>
      <button className="p-4 text-white" onClick={() => setOpen(true)}>
        Open Drawer
      </button>
      <AnimatePresence>
        {open && (
          <Dialog open onClose={setOpen} className="fixed z-50">
            <DialogPanel
              as={Drawer}
              className="z-2 w-full border lg:max-w-96 bg-white dark:bg-[#1F1F1FFF]"
              defaultOpen={open}
              onOpenChange={setOpen}
            >
              <DrawerHeader className="flex items-center justify-between p-4 select-none border-b dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                  <div>
                    <h3 className="font-semibold dark:text-neutral-100">
                      Motion Drawer
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Just now
                    </p>
                  </div>
                </div>
                <button className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                </button>
              </DrawerHeader>
              <DrawerBody className="p-4 space-y-4 select-none">
                {comments.slice(0, count).map((comment, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium dark:text-neutral-100">
                        {comment.author}
                      </p>
                      <p className="text-neutral-600 dark:text-neutral-300">
                        {comment.content}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <button className="hover:text-neutral-900 dark:hover:text-neutral-100">
                          Like
                        </button>
                        <button className="hover:text-neutral-900 dark:hover:text-neutral-100">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 gap-2 flex">
                  <button
                    className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 dark:hover:text-blue-300"
                    onClick={() => {
                      setCount((count) => count - 2);
                    }}
                  >
                    Remove
                  </button>
                  <button
                    className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 dark:hover:text-blue-300"
                    onClick={() => {
                      setCount((count) => count + 2);
                    }}
                  >
                    Add
                  </button>
                </div>
              </DrawerBody>
              <DrawerActions className="flex items-center gap-3 border-t dark:border-neutral-800 p-4">
                <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent outline-none dark:text-neutral-300 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
                <button className="text-blue-500 dark:text-blue-400 font-semibold hover:text-blue-600 dark:hover:text-blue-300">
                  Post
                </button>
              </DrawerActions>
            </DialogPanel>
            {/* Backdrop */}
            <DialogBackdrop
              as={motion.div}
              className="fixed inset-0 z-1 bg-black/25 backdrop-blur-xs"
              onClick={() => setOpen(false)}
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: {
                  opacity: 1,
                },
                closed: {
                  opacity: 0,
                },
              }}
            />
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
