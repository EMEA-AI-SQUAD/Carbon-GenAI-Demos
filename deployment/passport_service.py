#!/usr/bin/env python3
"""
PassportEye Extraction Service
Flask microservice for passport MRZ extraction using PassportEye
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from passporteye import read_mrz
import base64
from io import BytesIO
from PIL import Image
import numpy as np
import logging
import time
import tempfile
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'passporteye'})

@app.route('/extract', methods=['POST'])
def extract_passport():
    """
    Extract passport data from image
    
    Request body:
    {
        "image": "base64_encoded_image_data"
    }
    
    Response:
    {
        "success": true,
        "data": {
            "type": "P",
            "country": "GBR",
            "surname": "BEAN",
            "names": "MR",
            "number": "023477812",
            ...
        },
        "processing_time": 0.123
    }
    """
    start_time = time.time()
    
    try:
        # Get request data
        if not request.json or 'image' not in request.json:
            return jsonify({
                'success': False,
                'error': 'Missing image data in request'
            }), 400
        
        image_data = request.json['image']
        logger.info(f"Received image data: {len(image_data)} characters")
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            logger.info(f"Decoded {len(image_bytes)} bytes")
            
            # Open image with PIL
            image = Image.open(BytesIO(image_bytes))
            
            # Verify image loaded
            if image is None:
                raise ValueError("Failed to load image from bytes")
            
            # Convert to RGB if needed (PassportEye works best with RGB)
            if image.mode != 'RGB':
                logger.info(f"Converting image from {image.mode} to RGB")
                image = image.convert('RGB')
            
            logger.info(f"Image decoded: {image.size} pixels, {image.mode} mode")
            
            # Save image to temporary file (PassportEye works best with file paths)
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                temp_path = tmp_file.name
                image.save(temp_path, 'JPEG')
                logger.info(f"Saved temporary image: {temp_path}")
            
        except Exception as e:
            logger.error(f"Image decoding error: {str(e)}", exc_info=True)
            return jsonify({
                'success': False,
                'error': f'Invalid image data: {str(e)}'
            }), 400
        
        # Extract MRZ using PassportEye
        logger.info("Extracting MRZ with PassportEye...")
        try:
            mrz = read_mrz(temp_path)
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
                logger.info(f"Cleaned up temporary file: {temp_path}")
            except:
                pass
        
        if mrz:
            # Convert MRZ data to dictionary
            mrz_data = mrz.to_dict()
            processing_time = time.time() - start_time
            
            logger.info(f"MRZ extracted successfully in {processing_time:.3f}s")
            logger.info(f"Extracted data: {mrz_data}")
            
            return jsonify({
                'success': True,
                'data': mrz_data,
                'processing_time': round(processing_time, 3),
                'mrz_text': mrz.mrz_text if hasattr(mrz, 'mrz_text') else None
            })
        else:
            processing_time = time.time() - start_time
            logger.warning(f"Could not read MRZ from image (took {processing_time:.3f}s)")
            
            return jsonify({
                'success': False,
                'error': 'Could not read MRZ from image. Please ensure the passport MRZ (bottom two lines) is clearly visible.',
                'processing_time': round(processing_time, 3)
            }), 422
            
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Extraction error: {str(e)}", exc_info=True)
        
        return jsonify({
            'success': False,
            'error': f'Extraction failed: {str(e)}',
            'processing_time': round(processing_time, 3)
        }), 500

@app.route('/extract-file', methods=['POST'])
def extract_passport_file():
    """
    Extract passport data from uploaded file
    
    Form data:
    - file: Image file (multipart/form-data)
    """
    start_time = time.time()
    
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'Empty filename'
            }), 400
        
        # Read image
        image = Image.open(file.stream)
        logger.info(f"File uploaded: {file.filename}, {image.size} pixels")
        
        # Extract MRZ
        logger.info("Extracting MRZ with PassportEye...")
        mrz = read_mrz(image)
        
        if mrz:
            mrz_data = mrz.to_dict()
            processing_time = time.time() - start_time
            
            logger.info(f"MRZ extracted successfully in {processing_time:.3f}s")
            
            return jsonify({
                'success': True,
                'data': mrz_data,
                'processing_time': round(processing_time, 3)
            })
        else:
            processing_time = time.time() - start_time
            
            return jsonify({
                'success': False,
                'error': 'Could not read MRZ from image',
                'processing_time': round(processing_time, 3)
            }), 422
            
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Extraction error: {str(e)}", exc_info=True)
        
        return jsonify({
            'success': False,
            'error': f'Extraction failed: {str(e)}',
            'processing_time': round(processing_time, 3)
        }), 500

if __name__ == '__main__':
    logger.info("Starting PassportEye service on port 5000...")
    logger.info("Endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  POST /extract - Extract from base64 image")
    logger.info("  POST /extract-file - Extract from uploaded file")
    
    app.run(host='0.0.0.0', port=5000, debug=False)

# Made with Bob