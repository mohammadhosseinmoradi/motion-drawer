# Motion Drawer

A headless drawer with smooth animations and easily integrates with any headless
libraries such as [Headless UI](https://headlessui.com),
[React Aria](https://react-spectrum.adobe.com/react-aria),
[Radix UI](https://radix-ui.com), and more.

## Documentation

Visit [https://motion-drawer.vercel.app](https://motion-drawer.vercel.app) to view the full documentation.

## Getting Started

To start using the library, install it in your project:

```bash
npm install motion-drawer
# or
pnpm add motion-drawer
# or
yarn add motion-drawer
```

Simple usage:

```jsx
import { Drawer, DrawerHeader, DrawerBody, DrawerActions } from "motion-drawer";

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerHeader>Header</DrawerHeader>
      <DrawerBody>Main content goes here (scroll area)</DrawerBody>
      <DrawerActions>Actions</DrawerActions>
    </Drawer>
  );
}
```

Integrate it with [Headless UI](https://headlessui.com) library:

```tsx
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
  },
  {
    id: 2,
    author: "Mike Johnson",
    content:
      "Great work on this! Looking forward to using it in my next project 👍",
  },
  {
    id: 3,
    author: "Emily Chen",
    content: "The integration with other libraries is seamless! Well done 🎉",
  },
  {
    id: 4,
    author: "David Rodriguez",
    content:
      "The documentation is super clear and helpful. Makes implementation a breeze 📚",
  },
  {
    id: 5,
    author: "Alex Thompson",
    content:
      "Been using this in production for a month now. Rock solid performance! 💪",
  },
  {
    id: 6,
    author: "Lisa Park",
    content: "The customization options are exactly what I needed. Thanks! ✨",
  },
  {
    id: 7,
    author: "Chris Martinez",
    content:
      "Responsive design works perfectly across all devices. Great job! 📱",
  },
  {
    id: 8,
    author: "Sophie Anderson",
    content: "The spring animations make the interactions feel so natural 🌟",
  },
  {
    id: 9,
    author: "James Lee",
    content:
      "Best drawer implementation I've used so far. Keep up the good work! 🏆",
  },
  {
    id: 10,
    author: "Nina Patel",
    content:
      "Love how lightweight it is while still maintaining all the features 🎯",
  },
];

export default function MyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <AnimatePresence>
        {open && (
          <Dialog open onClose={setOpen} className="fixed z-50">
            <DialogPanel
              as={Drawer}
              className="z-2 w-full lg:w-[calc(100%-2rem)] border rounded-xl lg:max-w-96 bg-white dark:bg-[#1F1F1FFF]"
              defaultOpen={open}
              onOpenChange={setOpen}
              snapPoints={["400px", "auto"]}
              offset={16}
              padding={16}
              borderRadius={null}
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
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
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
```

Integrate it with [React Aria](https://react-spectrum.adobe.com/react-aria) library:

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components";
import { Drawer, DrawerActions, DrawerBody, DrawerHeader } from "motion-drawer";

const comments = [
  {
    id: 1,
    author: "Sarah Wilson",
    content: "Love the new updates! The animations are so smooth 🚀",
  },
  {
    id: 2,
    author: "Mike Johnson",
    content:
      "Great work on this! Looking forward to using it in my next project 👍",
  },
  {
    id: 3,
    author: "Emily Chen",
    content: "The integration with other libraries is seamless! Well done 🎉",
  },
  {
    id: 4,
    author: "David Rodriguez",
    content:
      "The documentation is super clear and helpful. Makes implementation a breeze 📚",
  },
  {
    id: 5,
    author: "Alex Thompson",
    content:
      "Been using this in production for a month now. Rock solid performance! 💪",
  },
  {
    id: 6,
    author: "Lisa Park",
    content: "The customization options are exactly what I needed. Thanks! ✨",
  },
  {
    id: 7,
    author: "Chris Martinez",
    content:
      "Responsive design works perfectly across all devices. Great job! 📱",
  },
  {
    id: 8,
    author: "Sophie Anderson",
    content: "The spring animations make the interactions feel so natural 🌟",
  },
  {
    id: 9,
    author: "James Lee",
    content:
      "Best drawer implementation I've used so far. Keep up the good work! 🏆",
  },
  {
    id: 10,
    author: "Nina Patel",
    content:
      "Love how lightweight it is while still maintaining all the features 🎯",
  },
];

const MotionModal = motion.create(Modal);
const MotionModalOverlay = motion.create(ModalOverlay);

export default function MyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onPress={() => setOpen(true)}>Open Drawer</Button>
      <AnimatePresence>
        {open && (
          <MotionModalOverlay
            // Force the modal to be open when AnimatePresence renders it.
            isOpen
            onOpenChange={setOpen}
            className="fixed z-50"
          >
            <MotionModal>
              <Drawer
                as={Dialog}
                className="z-2 w-full lg:w-[calc(100%-2rem)] border lg:max-w-96 bg-white dark:bg-[#1F1F1FFF]"
                defaultOpen={true}
                onOpenChange={setOpen}
                snapPoints={["390px", "auto"]}
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
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
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
              </Drawer>
              {/* Backdrop */}
              <motion.div
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
            </MotionModal>
          </MotionModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
```

Integrate it with [Radix UI](https://radix-ui.com) library:

```tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { Drawer, DrawerActions, DrawerBody, DrawerHeader } from "motion-drawer";

const comments = [
  {
    id: 1,
    author: "Sarah Wilson",
    content: "Love the new updates! The animations are so smooth 🚀",
  },
  {
    id: 2,
    author: "Mike Johnson",
    content:
      "Great work on this! Looking forward to using it in my next project 👍",
  },
  {
    id: 3,
    author: "Emily Chen",
    content: "The integration with other libraries is seamless! Well done 🎉",
  },
  {
    id: 4,
    author: "David Rodriguez",
    content:
      "The documentation is super clear and helpful. Makes implementation a breeze 📚",
  },
  {
    id: 5,
    author: "Alex Thompson",
    content:
      "Been using this in production for a month now. Rock solid performance! 💪",
  },
  {
    id: 6,
    author: "Lisa Park",
    content: "The customization options are exactly what I needed. Thanks! ✨",
  },
  {
    id: 7,
    author: "Chris Martinez",
    content:
      "Responsive design works perfectly across all devices. Great job! 📱",
  },
  {
    id: 8,
    author: "Sophie Anderson",
    content: "The spring animations make the interactions feel so natural 🌟",
  },
  {
    id: 9,
    author: "James Lee",
    content:
      "Best drawer implementation I've used so far. Keep up the good work! 🏆",
  },
  {
    id: 10,
    author: "Nina Patel",
    content:
      "Love how lightweight it is while still maintaining all the features 🎯",
  },
];

export default function MyDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      <AnimatePresence>
        {open && (
          <Dialog open onOpenChange={setOpen}>
            <DialogPortal>
              <DialogOverlay className="z-50 fixed">
                <DialogContent asChild forceMount>
                  <Drawer
                    className="z-2 w-full lg:w-[calc(100%-2rem)] border lg:max-w-96 bg-white dark:bg-[#1F1F1FFF]"
                    defaultOpen
                    onOpenChange={setOpen}
                    snapPoints={["390px", "auto"]}
                  >
                    <DrawerHeader className="flex items-center justify-between p-4 select-none border-b dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                        <div>
                          <DialogTitle className="font-semibold dark:text-neutral-100">
                            Motion Drawer
                          </DialogTitle>
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
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start gap-3"
                        >
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
                  </Drawer>
                </DialogContent>
                <motion.div
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
              </DialogOverlay>
            </DialogPortal>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}
```