import argparse
import datetime
import imutils
import time
import math
import cv2
import sys
from firebase import firebase
import time
from random import randint

faceCascade = cv2.CascadeClassifier("haarcascade_frontalface_default.xml");
video_capture = cv2.VideoCapture(0);
temp = 25;
interval = 30;
firebase = firebase.FirebaseApplication('https://climatecontrolprjct.firebaseio.com/');    

def update(energy,saved,occ,ctemp,stemp,cost):
     dataPost = firebase.put('/data1/occupants','value',occ);

startTime=time.time();

while True:
    # Capture frame-by-frame
    ret, frame = video_capture.read();
    frame = imutils.resize(frame, width=700);
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY);
    faces = faceCascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30), flags=cv2.CASCADE_SCALE_IMAGE);
    headCount = len(faces);
    # Draw a rectangle around the faces
    for (x, y, w, h) in faces:
          cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2);
    if math.fabs(headCount%5)==2:
          temp = temp-2;
    else:
          temp = 25;
    # text = str(temp);
    # cv2.putText(frame, "Suggested temperature: {}".format(text), (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2); #Draw the text and timestamp on the frame
    # cv2.putText(frame, datetime.datetime.now().strftime("%A %d %B %Y %I:%M:%S%p"), (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1);
    # Display the resulting frame
    cv2.imshow('Video', frame);
    if cv2.waitKey(1) & 0xFF == ord('q'):
          break;
    if (int(time.time()-startTime)%interval==0 and int(time.time()-startTime)!=0):
          startTime=time.time();
          print (headCount);
          # update(randint(1,15),randint(0,100),headCount,randint(18,27),randint(18,27),randint(0,100));
          dataPost = firebase.put('/data1/occupants','value',headCount);
    else:
          startTime = time.time() if int(time.time()-startTime)>interval else startTime;
          # print (str(int(time.time()-startTime))+' '+str(int(time.time()-startTime)%interval));

# When everything is done, release the capture
video_capture.release();
cv2.destroyAllWindows();
