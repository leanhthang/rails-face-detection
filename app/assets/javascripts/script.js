var video = $('#inputVideo')[0];
let canvas = $('#canvas')[0];
let inputCMNDFront = $('#CMNDFront')[0];
let inputCMNDBack = $('#CMNDBack')[0];
function uploadCMND(event, prev_img_id) {
  $(`#${prev_img_id}`).removeClass('d-none');
  var reader = new FileReader();
  reader.onload = function(){
    var output = document.getElementById(prev_img_id);
    output.src = reader.result;
  };
  reader.readAsDataURL(event.target.files[0]);
  resetDector();
}

function videoOnPlay() {
  var video = $('#inputVideo')[0];
  video.play();
  let canvas = $('#canvas')[0];
  let inputCMNDFront = $('#CMNDFront')[0];
  let inputCMNDBack = $('#CMNDBack')[0];
  if (!inputCMNDFront.files[0] || !inputCMNDBack.files[0]) {
    alert('Chưa có CMND/CCCD mặt trước/ Mặt sau');
    return false;
  }
  loadFaceapi();
  loading(true);
  let cameraAtion = null;
  let detecttionIsActive = false;
  video.onplay = function() {
      const displaySize = { width: video.width, height: video.height }
      faceapi.matchDimensions(canvas, displaySize)
      console.log("asdas")
      setInterval(async () => {
          // let image = await faceapi.fetchImage(avatar.src)
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks().withFaceDescriptors()
          // .withFaceExpressions()
          const resizedDetections = faceapi.resizeResults(detections, displaySize)

          if (detecttionIsActive == false) {
            canvas.getContext('2d').clearRect(0, 0, video.width, video.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
          }


        clearTimeout(cameraAtion);
        cameraAtion = setTimeout(async () => {

          const labeledFaceDescriptors = await loadLabeledImages()
          const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.55)

          const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))


            results.forEach((result, i) => {
              canvas.getContext('2d').clearRect(0, 0, video.width, video.height)
              detecttionIsActive = true;
              const box = resizedDetections[i].detection.box
              if (result._distance <= 0.55) {
                successDetector(result._distance);
              } else {
                resetDector();
              }
              const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
              drawBox.draw(canvas)
            });
        }, 50);
      }, 50)
  };
}

function loadFaceapi() {
  var video = $('#inputVideo')[0];
  video.play();
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
  ]).then(startVideo);
}
function startVideo() {var video = $('#inputVideo')[0];
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

function loadLabeledImages() {
  let inputCMNDFront = $('#CMNDFront')[0];
  let inputCMNDBack = $('#CMNDBack')[0];
  loading(false);
  const labels = [$('#kh-name').text()]
  return Promise.all(
    labels.map(async label => {
      const descriptions = []
      for (let i = 1; i <= 2; i++) {

        const cmnd = await faceapi.bufferToImage(inputCMNDFront.files[0]);
        const detections = await faceapi.detectSingleFace(cmnd)
            .withFaceLandmarks()
            .withFaceDescriptor()
        descriptions.push(detections.descriptor)
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}

function resetDector(){
  $('#ekyc-label-is-confirm').removeClass('text-success').addClass('text-danger').html('(Chưa xác thực)');
  $('#ekyc-alert-success').addClass('d-none');
  // canvas.getContext('2d').clearRect(0, 0, video.width, video.height)
}

function successDetector(distance) {
  percent = Math.round((1-distance)*100);
  $('#ekyc-label-is-confirm').removeClass('text-danger').addClass('text-success').html(`(Hình ảnh khớp ~${percent}%)`);
  $('#ekyc-alert-success').removeClass('d-none');
  $('#ekyc-like-percent').html(`~${percent}%`);
}

// const sp_url = 'http://122.248.226.101:3001';
// const api_url = '//122.248.226.101:3000';
const api_url = 'http://localhost:3000';
const sp_lead_id = window.location.href.split('leads/informations/')[1];

$(function(){
  loading(true);
  $.ajax({
    type: 'POST',
    data: { sp_link: `${api_url}/api/v1/leads/${sp_lead_id}/ekyc_data` },
    url: '/fetch_lead'
  })
  .done(function(data) {
    console.log(data);
    $('#kh-name').html(data.data.basic_info.name);
    if (data.data.ekyc.status == false) {
      $('.img-thumbnail').removeClass('d-none')
    } else {
      $('.btn-redetect').removeClass('d-none');
      $('.custom-file').addClass('d-none');
      $('#ekyc-label-is-confirm').removeClass('text-danger').addClass('text-success').html('(Đã xác thực)')
      $('#previewCMNDFront').removeClass('d-none').attr('src', data.data.ekyc.cmnd_front);
      $('#previewCMNDBack').removeClass('d-none').attr('src', data.data.ekyc.cmnd_back);
    }
  }).always(function() {
    loading(false);
  });
});

function loading(visible) {
  if (visible == true) {
    $('.loading').removeClass('d-none');
  } else {
    $('.loading').addClass('d-none');
  }
}

function takepicture(video) {
  canvas_camera = document.getElementById('canvas_camera');
  var width = 400;
  height = video.videoHeight / (video.videoWidth / width);

  if (isNaN(height)) {
      height = width / (4 / 3);
  }
  var context = canvas_camera.getContext('2d');
  if (width && height) {
      canvas_camera.width = width;
      canvas_camera.height = height;
      context.drawImage(video, 0, 0, width, height);

      var data = canvas_camera.toDataURL('image/jpg');
      $('#ekyc_image').val(data);
  }
}