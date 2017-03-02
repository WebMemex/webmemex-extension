import { makeRemotelyCallable } from '../../util/webextensionRPC'

import extractPdfText from './extract-pdf-text'
import extractPdfMetadata from './extract-pdf-metadata'



makeRemotelyCallable({
    extractPdfText,
    extractPdfMetadata,
})
