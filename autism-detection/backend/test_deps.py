try:
    import mediapipe as mp
    print("MediaPipe imported successfully")
except Exception as e:
    print(f"MediaPipe import failed: {e}")

try:
    import cv2
    print("OpenCV imported successfully")
except Exception as e:
    print(f"OpenCV import failed: {e}")

try:
    import tensorflow as tf
    print("TensorFlow imported successfully")
except Exception as e:
    print(f"TensorFlow import failed: {e}")
