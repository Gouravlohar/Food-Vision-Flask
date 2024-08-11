from flask import Flask,render_template,request, redirect, url_for,jsonify
import google.generativeai as genai
from PIL import Image
import base64
import io
import os
my_api_key_gemini = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=my_api_key_gemini)
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    uploaded_file = request.files['uploadInput']
    
    if uploaded_file:
        image = Image.open(uploaded_file)
        
        # Ensure correct mime type based on file extension
        if uploaded_file.filename.endswith('.jpg') or uploaded_file.filename.endswith('.jpeg'):
            mime_type = 'image/jpeg'
        elif uploaded_file.filename.endswith('.png'):
            mime_type = 'image/png'
        else:
            return jsonify(error='Unsupported file format'), 400
        
        # Encode image to base64 for sending to API
        buffered = io.BytesIO()
        image.save(buffered, format=image.format)
        encoded_image = base64.b64encode(buffered.getvalue()).decode('utf-8')

        image_parts = [{
            "mime_type": mime_type,
            "data": encoded_image
        }]
        
        input_prompt = """
            You are an expert in nutritionist where you need to see the food items from the image
            and calculate the total calories, also provide the details of every food items with calories intake
            is below format

            1. Item 1 - no of calories, protein
            2. Item 2 - no of calories, protein
            ----
            ----
            Also mention disease risk from these items
            Finally you can also mention whether the food items are healthy or not and Suggest Some Healthy Alternative 
            is below format          
            1. Item 1 - no of calories, protein
            2. Item 2 - no of calories, protein
            ----
            ----
        """

        # Simulate API response (replace with actual API call)
        model1 = genai.GenerativeModel('gemini-1.5-flash')
        response = model1.generate_content([input_prompt, image_parts[0]])
        result = response.text

        return jsonify(result=result, image=encoded_image)
    
    return jsonify(error='No file uploaded'), 400

if __name__ == "__main__":
    app.run(debug=True)         
    