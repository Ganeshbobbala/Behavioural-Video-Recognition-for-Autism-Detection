import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

try:
    import tensorflow as tf
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense, Dropout, TimeDistributed, Conv1D, MaxPooling1D, Flatten
    HAS_TENSORFLOW = True
except ImportError:
    HAS_TENSORFLOW = False

def build_behavior_model(input_shape=(None, 30, 3)):
    if not HAS_TENSORFLOW:
        return None
    model = Sequential([
        TimeDistributed(Conv1D(filters=64, kernel_size=3, activation='relu', padding='same'), input_shape=input_shape),
        TimeDistributed(MaxPooling1D(pool_size=2)),
        TimeDistributed(Flatten()),
        LSTM(64, return_sequences=False),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dense(4, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    if HAS_TENSORFLOW:
        print("TensorFlow Version:", tf.__version__)
        model = build_behavior_model()
        model.summary()
        print("CNN+LSTM Architecture Validated Successfully.")
    else:
        print("TensorFlow not found. Proceeding with Landmark-Heuristic Analysis Fallback.")
