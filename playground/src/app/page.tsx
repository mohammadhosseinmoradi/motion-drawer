"use client";

import { Drawer, DrawerHeader, DrawerBody, DrawerActions } from "motion-drawer";
import React, { ReactNode, useState } from "react";
import { Dialog, DialogPanel, Disclosure } from "@headlessui/react";
import { motion, AnimatePresence } from "motion/react";

export default function Page() {
  return (
    <div className="flex text-neutral-200 h-1000">
      <MyDrawer>
        <MyDrawer />
      </MyDrawer>
    </div>
  );
}

function MyDrawer({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="p-4"
        onClick={() => {
          setOpen(true);
        }}
      >
        Open drawer
      </button>
      <AnimatePresence>
        {open && (
          <Dialog className="z-50 fixed" open={open} onClose={setOpen}>
            <DialogPanel
              as={Drawer}
              className="bg-neutral-800 z-2 text-white w-[calc(100%-2rem)] max-w-96 rounded-xl select-none"
              snapPoints={["50%", "100%"]}
              defaultSnapPoint="50%"
              defaultOpen={true}
              onOpenChange={setOpen}
              offset={16}
              padding={16}
              borderRadius={null}
              minSize={200}
            >
              <DrawerHeader className="bg-neutral-800 flex items-center justify-center border-b p-4">
                Header
              </DrawerHeader>
              <DrawerBody>
                <button className="m-4" onClick={() => setOpen(false)}>
                  Close drawer
                </button>
                {children}
                <div className="p-4 flex flex-col gap-4">
                  <HorizontalScroll />
                  <OverflowAuto />
                  <VerticalScroll />
                  <Disclosure>
                    <Disclosure.Button className="data-open:text-green-500 mx-auto border">
                      More
                    </Disclosure.Button>
                    <Disclosure.Panel>
                      <EmptyArea />
                      <OverflowAuto />
                      <EmptyArea />
                      <EmptyArea />
                    </Disclosure.Panel>
                  </Disclosure>
                  <Disclosure>
                    <Disclosure.Button className="data-open:text-green-500 mx-auto border">
                      More
                    </Disclosure.Button>
                    <Disclosure.Panel>
                      <EmptyArea />
                    </Disclosure.Panel>
                  </Disclosure>
                </div>
              </DrawerBody>
              <DrawerActions className="bg-neutral-800 flex items-center justify-center border-t p-4 pb-6">
                Actions
              </DrawerActions>
            </DialogPanel>
            <motion.div
              className="fixed inset-0 z-1 pointer-events-none backdrop-blur-xs bg-black/25"
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
    </div>
  );
}

function HorizontalScroll() {
  return (
    <div className="flex gap-6 overflow-auto border">
      {[...Array(50)].map((_, i) => {
        return (
          <div
            key={i}
            className="h-10 w-10 justify-center flex items-center bg-neutral-800 rounded-full"
          >
            {i}
          </div>
        );
      })}
    </div>
  );
}

function VerticalScroll() {
  return (
    <div className="flex flex-col gap-6 overflow-auto touch-auto border h-32">
      {[...Array(10)].map((_, i) => {
        return (
          <div
            key={i}
            className="h-10 w-full flex justify-center items-center bg-neutral-800 rounded-full"
          >
            {i}
          </div>
        );
      })}
    </div>
  );
}

function EmptyArea() {
  return (
    <div className="flex justify-center items-center gap-6 border h-32">
      Empty Area
    </div>
  );
}

function OverflowAuto() {
  return (
    <div
      className="flex justify-center items-center gap-6 overflow-auto border h-32"
      onTouchStart={(e) => e.preventDefault()}
      onScroll={(e) => e.preventDefault()}
    >
      Overflow Auto
    </div>
  );
}
