/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Image as LucideImage } from "lucide-react";
import { Plus } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { avatars } from "@/components/dashboard/interviewer/avatars";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInterviewers } from "@/contexts/interviewers.context";
import { useClerk } from "@clerk/nextjs";

const createInterviewerCard = () => {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [name, setName] = useState("");
  const [empathy, setEmpathy] = useState(0.4);
  const [rapport, setRapport] = useState(0.7);
  const [exploration, setExploration] = useState(0.2);
  const [speed, setSpeed] = useState(0.9);
  const [image, setImage] = useState("");
  const { createInterviewer } = useInterviewers();
  const { user } = useClerk();
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmpathy(0.4);
      setRapport(0.7);
      setExploration(0.2);
      setSpeed(0.9);
      setImage("");
    }
  }, [open]);

  const onSave = async () => {
    await createInterviewer({
      name: name,
      empathy: empathy * 10,
      rapport: rapport * 10,
      exploration: exploration * 10,
      speed: speed * 10,
      user_id: user?.id,
      image: image,
    });
    setIsClicked(false);
    setOpen(false);
  };

  return (
    <>
      {/* <Card
        
        className="border-dashed border-gray-700 border-4 p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-5 w-5 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md"
      >
        <CardContent className="p-0">
          <div className="flex flex-col justify-center items-center w-full p-4 pb-0 mt-8 overflow-hidden">
            
          </div>
          {/* <CardTitle className="p-0 m-2 mx-0 text-xs text-center">
            Add Interviewer
          </CardTitle> 
        </CardContent>
      </Card> */}
      <Plus
        size={30}
        strokeWidth={2}
        className="cursor-pointer bg-indigo-600 rounded-full text-white"
        onClick={() => setOpen(true)}
      />
      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="text-center w-[35rem]">
          <CardTitle className="text-2xl text mt-0 mb-4 p-0 font-semibold ">
            Create an interviewer yourself!
          </CardTitle>
          <div className="mt-3 p-2 flex flex-row justify-center space-x-10 items-center">
            <div
              className=" flex flex-col items-center justify-center overflow-hidden border-4 border-gray-500 rounded-xl h-56 w-52"
              onClick={() => setGallery(true)}
            >
              {image ? (
                <Image
                  src={image}
                  alt="Picture of the interviewer"
                  width={200}
                  height={40}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div>
                  <LucideImage
                    className="mt-3 text-gray-300"
                    size={100}
                    strokeWidth={0.7}
                  />
                  <h4 className="text-xs text-center font-medium text-gray-400">
                    Choose an Avatar
                  </h4>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center items-start ml-4">
              <div className="flex flex-row justify-center items-center">
                <h3 className="text-lg font-medium">Name</h3>
                <input
                  type="text"
                  className="border-b-2 focus:outline-none border-gray-500 px-2 py-0.5 ml-3 w-[12.5rem]"
                  placeholder="e.g. Empathetic Bob"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <h3 className="text-lg mt-3 font-medium">Interviewer Settings</h3>
              <div className="ml-5 mt-2 flex flex-col justify-start items-start">
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Empathy</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[empathy]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setEmpathy(value[0])}
                    />
                    <span className="w-8 text-left">{empathy}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Rapport</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[rapport]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setRapport(value[0])}
                    />
                    <span className="w-8 text-left">{rapport}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Exploration</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[exploration]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setExploration(value[0])}
                    />
                    <span className="w-8 text-left">{exploration}</span>
                  </div>
                </div>
                <div className="flex flex-row justify-between items-center mb-2">
                  <h4 className="w-20 text-left">Speed</h4>
                  <div className="w-40 space-x-3 ml-3 flex justify-between items-center">
                    <Slider
                      value={[speed]}
                      max={1}
                      step={0.1}
                      onValueChange={(value) => setSpeed(value[0])}
                    />
                    <span className="w-8 text-left">{speed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end mr-4">
            <Button
              disabled={(name && image ? false : true) || isClicked}
              className="bg-indigo-600  hover:bg-indigo-800"
              onClick={() => {
                setIsClicked(true);
                onSave();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        open={gallery}
        closeOnOutsideClick={true}
        onClose={() => {
          setGallery(false);
        }}
      >
        <div className="text-left w-[20rem]">
          <CardTitle className="text-xl text mt-0 p-0 font-semibold ">
            Select an Avatar
          </CardTitle>
          <ScrollArea className="mt-3 h-96">
            <div className="flex flex-row flex-wrap justify-center items-center">
              {avatars.map((item, key) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center justify-center border-2 border-gray-500 rounded-xl overflow-hidden m-2 cursor-pointer"
                  onClick={() => {
                    setImage(item.img);
                    setGallery(false);
                  }}
                >
                  <Image alt="avatar" width={125} height={100} src={item.img} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Modal>
    </>
  );
};

export default createInterviewerCard;
