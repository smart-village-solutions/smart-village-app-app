# Augmented Reality Documentation

The information required to use the Augmented Reality feature will be specified here

## Package used and system requirements

![Viro](https://raw.githubusercontent.com/ViroCommunity/virocommunity.github.io/main/viro_community_logo.png)

- [Viro](https://viro-community.readme.io)
- [iOS Requirements](https://developer.apple.com/library/archive/documentation/DeviceInformation/Reference/iOSDeviceCompatibility/DeviceCompatibilityMatrix/DeviceCompatibilityMatrix.html)
- [Android Requirements](https://developers.google.com/ar/devices)

## What to do on the server side

![](./assets/ModelUpload/ModelUpload0.png)

- Go to the CMS page and log in

![](./assets/ModelUpload/ModelUpload1.png)

- Go to the list of tours

![](./assets/ModelUpload/ModelUpload2.png)

- Select the tour you want to add Augmented Reality feature to

![](./assets/ModelUpload/ModelUpload3.png)

- Add new "Tourstopps" on the tour detail page
- Edit the sections added for Augmented Reality in "Tourstopps"

![](./assets/ModelUpload/ModelUpload4.png)
![](./assets/ModelUpload/ModelUpload5.png)
![](./assets/ModelUpload/ModelUpload6.png)
![](./assets/ModelUpload/ModelUpload7.png)

- To find out what types of files (materials) you can upload, see the [next section](#materials-that-can-be-added-to-a-scene)

- Press the `AR Scene Hinzufügen` button to add a new Augmented Reality scene

![](./assets/ModelUpload/ModelUpload9.png)

- After entering all the information, press the save button

![](./assets/ModelUpload/ModelUpload8.png)

### How to upload 3D model (video)

[![](./assets/ModelUpload/thumb.png)](https://www.youtube.com/watch?v=0i_jmbDfhes)

## Materials that can be added to a scene

- **VRX:** To upload a 3D model, you must make sure that the model is in VRX format. [VRX Converter](#converter-required-when-uploading-a-3d-model-mac-osx--linux-support-only) (Required) [Viro3DObject](https://viro-community.readme.io/docs/viro3dobject)
- **TARGET:** If you want your 3D model to have an image recognition function, upload the desired image in this section (Optional) [ViroARImageMarker](https://viro-community.readme.io/docs/viroarimagemarker)
- **MP3:** If you want a sound file in Augmented Reality scene, upload it to this section (Optional) [ViroSound](https://viro-community.readme.io/docs/virosound)
- **MP4:** If you want a video on Augmented Reality scene, please upload it to this section (Optional) [ViroVideo](https://viro-community.readme.io/docs/virovideo)
- **IMAGE:** If you want a picture in the Augmented Reality scene, upload it to this section (Optional) [ViroImage](https://viro-community.readme.io/docs/viroimage)
- **Light:** If you wish, you can change the lighting settings of the scene from this tab (Optional)
[ViroAmbientLight](https://viro-community.readme.io/docs/viroambientlight)
- **TEXTURE:** The section where you can upload the multiple texture files required for the 3D model (Required)
  - :warning: Each texture file has a specific name. Please enter this specific name in the name field. Otherwise there will be a problem in displaying the 3D model.

File naming examples:

**TEXTURE:**
|File name|File type|Upload name|
|--|--|--|
|1simple|texture|1simple|
|2simple|texture|2simple|

**Other types:**
|File name|File type|CMS name|
|--|--|--|
|image|target|augmentedRealityTargetImage|
|bild12|png|test-bild|
|video3|mp4|test-vid|
|sound|mp3|music|
|3dobject|vrx|test-123123|

This shows, that the texture name needs to be the same as the name of the texture file in the 3D model. The other files can have any name.

## Customization of the Augmented Reality scene

**Note!** To view the customization in Augmented Reality scene, you need to delete the 3D model you downloaded in the application and download it again!

- **Name:** Write the name you want your 3D model to be displayed in this section (Required) (String)
- **Description:** Write the description you want your 3D model to be displayed in this section (Optional) (String)
- **Geo-Koordinaten:**
  - **Latitude & Longitude:** Write the coordinates of your 3D model that you want to be displayed on the map in this section (Optional) (Float)
- **Animation name:** The field where the name of the animation of the 3D model can be written (Optional) (String)
- **Package size:** This is the field where the total size of all Augmented Reality scene objects you have loaded should be written in bytes. The value added to this section allows the user to show how many MB files will be downloaded in the application. (Required) (Number)
- **VRX & MP4 & IMAGE:**
  - Set the _Position_, _Size_ and _Rotation_ properties according to x, y, z coordinates. Example: [0, 20, 0] (Array[Float]) [Scenes](https://viro-community.readme.io/docs/scenes)
- **TARGET:**
  - _Physical width_ - The width of the image in the real world in meters. (Number)
- **MP3:**
  - _Is spatial sound_ - A field that allows you to specify whether the audio file you are uploading has spatial audio capability. Takes `true` or `false` value [ViroSpatialSound](https://viro-community.readme.io/docs/virospatialsound#onfinish)
  - If _Is spatial sound_ is `true`:
    - _Max distance_ - A distance (in meters) after which the audio can not be heard. (Number)
    - _Min distance_ - A distance (in meters) after which the audio will begin to attenuate until _Max distance_ where the sound is completely gone. (Number)
    - _Rolloff model_ - The rolloff model which determines how the sound volume will fall off between _Min distance_ and _Max distance_. Can take `None`, `Linear` & `Logarithmic` values as String
- **MP4:**
  - _Chroma key filtered video_ - If the video you want to add to the Augmented Reality scene has a background color that you want to delete, add the color code in HEX format here. Example: #00FF00 (String)
- **Light:**
  - _Color_ - The color of the light. The default light color is white. Valid color formats are:
    - '#f0f' (#rgb)
    - '#f0fc' (#rgba)
    - '#ff00ff' (#rrggbb)
    - '#ff00ff00' (#rrggbbaa)
    - 'rgb(255, 255, 255)'
    - 'rgba(255, 255, 255, 1.0)'
    - 'hsl(360, 100%, 100%)'
    - 'hsla(360, 100%, 100%, 1.0)'
    - 'transparent'
    - 'red'
    - 0xff00ff00 (0xrrggbbaa)
  - _Temperature_ - The temperature of the light, in Kelvin. Viro will derive a hue from this temperature and multiply it by the light's color. To model a physical light with a known temperature, you can leave the color of this Light set to (1.0, 1.0, 1.0) and set its temperature only. The default value for temperature is 6500K, which represents pure white light. (Number)
  - _Intensity_ - The brightness of the light. Set to 1000 for normal intensity. The intensity is simply divided by 1000 and multiplied by the light's color. Lower intensities will decrease the brightness of the light, and higher intensities will increase the brightness of the light. The default intensity is 1000. (Number)
  - _Rotation_ - The rotation of the component around it's local axis specified as Euler angles [x, y, z]. Units for each angle are specified in degrees. (Array[Number])

## View AR added in a tour stop in the app

To download the 3D model from the tour detail screen:

1. Find tours inside the app from the home screen or the drawer menu,
2. Scroll to the category of the tour where you have added tour stops and select it,
3. Select the tour you added tour stops to from the displayed tour list and scroll to the bottom of the tour details page,
4. Select the downloaded file from the artworks list, click on the button and wait for the 3D object to download,
5. When finished, click the next button to view the 3D model on the screen that is navigated to.

To download the 3D model from the settings screen:

1. Go to the settings page of the application.
2. Select `AR Settings`.
3. Download the "Sample File" to your device.

To delete the 3D model from the device:

1. Open the detail page of the relevant tour.
2. Scroll down the detail page.
3. Click on the "Kunstwerke laden" button and wait for the modal to open.
4. In the opened modal, an "x" will be displayed next to the items you have downloaded to your device
5. Click on the downloaded item. Select "Delete" on the warning screen.
6. If you see the download button again, the 3D object has been deleted from your device.

Delete the 3D model from the settings screen:

1. Go to the settings page of the app.
2. Select "AR settings".
3. In the list you will see an "x" next to the items you have downloaded to your device.
4. Click on the downloaded item. Select "Delete" on the warning screen.
5. When you see the download button again, the 3D object has been deleted from your device.

## Converter required when uploading a 3D model (Mac OSX & Linux support only)

- [Download](https://fileserver.smart-village.app/development/augmented-reality/VRX_Converter/bin/ViroFBX.zip) FBX to VRX converter
- [Viro Community Documentation](https://viro-community.readme.io/docs/3d-objects#fbx)
- [ViroFBX Github Documentation (MacOS)](https://github.com/ViroCommunity/ViroFBX)
- [ViroFBX Github Documentation (Linux)](https://github.com/ViroCommunity/ViroFBX/tree/linux-support)

### How to use Converter (images)

![](./assets/VRXConverter/VRXConverter1.png)
![](./assets/VRXConverter/VRXConverter2.png)
![](./assets/VRXConverter/VRXConverter3.png)
![](./assets/VRXConverter/VRXConverter4.png)

### How to use Converter (video)

[![](./assets/VRXConverter/thumb.png)](https://www.youtube.com/watch?v=VANrglRc5v4)
